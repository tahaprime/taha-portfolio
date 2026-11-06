/**
 * Pointer-driven image distortion ("displacement grid") in raw WebGL2.
 *
 * Design, and how it differs from a one-renderer-per-image approach:
 *  - ONE context for the whole site. The canvas is attached to whichever plate is
 *    hovered, so at most one GPU context ever exists.
 *  - The render loop only runs while there is visible energy or the pointer is
 *    moving; it stops (0 draw calls/s) once the field has relaxed.
 *  - The canvas never receives pointer events, so the card link underneath stays
 *    fully clickable; listeners live on the card.
 *  - A light per-channel offset gives a subtle RGB split along the displacement.
 *
 * Loaded lazily (dynamic import) and only on hover-capable, motion-allowed devices.
 */

const CELL_PX = 30; // grid cell size in CSS pixels
const RELAX = 0.9; // per-frame (at 60fps) decay of the displacement field
const RADIUS = 0.2; // influence radius as a fraction of the plate width
const FORCE = 2.1; // how strongly cursor velocity pushes cells
const AMOUNT = 0.052; // max UV displacement
const EPS = 0.003; // below this the field is considered settled

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTex;
uniform sampler2D uField;
uniform vec2 uScale;
uniform float uAmount;
void main() {
  vec2 f = texture(uField, vUv).rg;
  vec2 uv = (vUv - 0.5) * uScale + 0.5;
  vec2 d = f * uAmount;
  float r = texture(uTex, uv - d * 1.00).r;
  float g = texture(uTex, uv - d * 0.80).g;
  float b = texture(uTex, uv - d * 0.60).b;
  outColor = vec4(r, g, b, 1.0);
}`;

type Tex = { tex: WebGLTexture; aspect: number };

class Distortion {
  private canvas = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private fieldTex: WebGLTexture;
  private textures = new Map<string, Tex>();
  private uTex: WebGLUniformLocation | null;
  private uField: WebGLUniformLocation | null;
  private uScale: WebGLUniformLocation | null;
  private uAmount: WebGLUniformLocation | null;

  private host: HTMLElement | null = null;
  private current: Tex | null = null;
  private plateW = 1;
  private plateH = 1;
  private cols = 1;
  private rows = 1;
  private field = new Float32Array(2);

  private raf = 0;
  private last = 0;
  private lastMove = 0;
  private px = 0.5;
  private py = 0.5;
  private vx = 0;
  private vy = 0;
  private pointerIn = false;
  private lost = false;
  private hideTimer = 0;

  constructor() {
    const gl = this.canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.canvas.setAttribute("aria-hidden", "true");
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .25s ease",
    });
    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.lost = true;
      this.detach();
    });

    this.program = this.link(VERT, FRAG);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(this.program);
    this.uTex = gl.getUniformLocation(this.program, "uTex");
    this.uField = gl.getUniformLocation(this.program, "uField");
    this.uScale = gl.getUniformLocation(this.program, "uScale");
    this.uAmount = gl.getUniformLocation(this.program, "uAmount");
    gl.uniform1i(this.uTex, 0);
    gl.uniform1i(this.uField, 1);
    gl.uniform1f(this.uAmount, AMOUNT);

    const ft = gl.createTexture();
    if (!ft) throw new Error("texture");
    this.fieldTex = ft;
    window.addEventListener("resize", this.onResize, { passive: true });
  }

  private link(vs: string, fs: string) {
    const gl = this.gl;
    const make = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error("shader");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "compile");
      return s;
    };
    const p = gl.createProgram();
    if (!p) throw new Error("program");
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    return p;
  }

  private textureFor(img: HTMLImageElement, cssW: number): Tex | null {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.min(2048, Math.max(64, Math.round(cssW * dpr)));
    const key = `${img.currentSrc || img.src}@${w}`;
    const hit = this.textures.get(key);
    if (hit) return hit;
    if (!img.complete || !img.naturalWidth) return null;
    const aspect = img.naturalWidth / img.naturalHeight;
    const h = Math.max(1, Math.round(w / aspect));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const tex = gl.createTexture();
    if (!tex) return null;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (this.textures.size >= 10) {
      const oldest = this.textures.keys().next().value;
      if (oldest !== undefined) {
        const old = this.textures.get(oldest);
        if (old) gl.deleteTexture(old.tex);
        this.textures.delete(oldest);
      }
    }
    const entry = { tex, aspect };
    this.textures.set(key, entry);
    return entry;
  }

  /** Attach the canvas to a hovered plate and start tracking the pointer. */
  attach(host: HTMLElement, img: HTMLImageElement): boolean {
    if (this.lost) return false;
    if (this.host === host) {
      this.pointerIn = true;
      return true;
    }
    this.detach(true);
    const rect = host.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return false;
    const tex = this.textureFor(img, rect.width);
    if (!tex) return false;

    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.plateW = rect.width;
    this.plateH = rect.height;
    this.cols = Math.max(4, Math.round(rect.width / CELL_PX));
    this.rows = Math.max(4, Math.round(rect.height / CELL_PX));
    this.field = new Float32Array(this.cols * this.rows * 2);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, this.cols, this.rows, 0, gl.RG, gl.FLOAT, this.field);

    const plateAspect = rect.width / rect.height;
    gl.useProgram(this.program);
    gl.uniform2f(
      this.uScale,
      tex.aspect > plateAspect ? plateAspect / tex.aspect : 1,
      tex.aspect > plateAspect ? 1 : tex.aspect / plateAspect,
    );

    window.clearTimeout(this.hideTimer);
    this.host = host;
    this.current = tex;
    this.pointerIn = true;
    host.appendChild(this.canvas);
    this.draw();
    requestAnimationFrame(() => (this.canvas.style.opacity = "1"));
    this.kick();
    return true;
  }

  /** Normalised pointer position inside the plate (0..1). */
  move(nx: number, ny: number) {
    this.vx = (nx - this.px) * 9;
    this.vy = (ny - this.py) * 9;
    this.px = nx;
    this.py = ny;
    this.lastMove = performance.now();
    this.kick();
  }

  /** Pointer left the plate: let the field relax, then detach. */
  release() {
    this.pointerIn = false;
    this.kick();
  }

  private kick() {
    if (!this.raf && this.host) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.host || this.lost) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    const k = Math.pow(RELAX, dt * 60);
    const f = this.field;
    let energy = 0;

    for (let i = 0; i < f.length; i++) {
      f[i] *= k;
      const a = Math.abs(f[i]);
      if (a > energy) energy = a;
    }

    if (this.pointerIn && (Math.abs(this.vx) > 0.0005 || Math.abs(this.vy) > 0.0005)) {
      const r = RADIUS * this.plateW;
      for (let j = 0; j < this.rows; j++) {
        const dy = ((j + 0.5) / this.rows - this.py) * this.plateH;
        for (let i = 0; i < this.cols; i++) {
          const dx = ((i + 0.5) / this.cols - this.px) * this.plateW;
          const dist = Math.hypot(dx, dy);
          if (dist >= r) continue;
          const w = (1 - dist / r) ** 2;
          const idx = (j * this.cols + i) * 2;
          f[idx] = Math.max(-1, Math.min(1, f[idx] + this.vx * w * FORCE));
          f[idx + 1] = Math.max(-1, Math.min(1, f[idx + 1] + this.vy * w * FORCE));
          const m = Math.max(Math.abs(f[idx]), Math.abs(f[idx + 1]));
          if (m > energy) energy = m;
        }
      }
    }
    this.vx *= Math.pow(0.82, dt * 60);
    this.vy *= Math.pow(0.82, dt * 60);

    this.draw();

    const settled = energy < EPS;
    if (settled && !this.pointerIn) {
      this.detach();
    } else if (settled && now - this.lastMove > 500) {
      // pointer resting on the plate: sleep until it moves again
      return;
    } else {
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  private draw() {
    if (!this.current) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.current.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.cols, this.rows, gl.RG, gl.FLOAT, this.field);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private detach(immediate = false) {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    const host = this.host;
    this.host = null;
    this.current = null;
    this.pointerIn = false;
    this.vx = this.vy = 0;
    this.canvas.style.opacity = "0";
    const remove = () => {
      if (this.canvas.parentElement && this.canvas.parentElement === host) host.removeChild(this.canvas);
    };
    if (immediate) remove();
    else this.hideTimer = window.setTimeout(remove, 280);
  }

  private onResize = () => {
    if (this.host) this.detach(true);
  };
}

let singleton: Distortion | null | undefined;

/** The shared instance, or null when WebGL2 is unavailable (the static image simply stays). */
export function getDistortion(): Distortion | null {
  if (singleton !== undefined) return singleton;
  try {
    singleton = new Distortion();
  } catch {
    singleton = null;
  }
  return singleton;
}

export type { Distortion };
