#!/usr/bin/env node
/**
 * Generates the site's artwork. Deterministic (seeded) and dependency-light:
 *   public/figures/<slug>.svg   six "specimen plates", one per project
 *   src/app/icon.svg            favicon (the registration mark)
 *   src/app/apple-icon.png      180×180 touch icon (rasterised with sharp)
 *
 * The plates are conceptual illustrations of what each project does, drawn in the
 * site's "Spec Sheet" language (paper, ink, one cobalt accent, blueprint grid, crop
 * marks). They contain NO text on purpose, so they render identically as <img>,
 * as a WebGL texture, and as an Open Graph asset, and they are never screenshots.
 *
 * Run: npm run figures
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const figDir = path.join(root, "public", "figures");
fs.mkdirSync(figDir, { recursive: true });

const PAPER = "#EDEAE2";
const INK = "#12110F";
const BLUE = "#2438F5";
const INK3 = "rgba(18,17,15,.26)";
const f = (n) => +n.toFixed(1);

/** mulberry32: small seeded PRNG. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// ---- primitives -------------------------------------------------------------
const line = (x1, y1, x2, y2, stroke = INK, w = 2, op = 1, extra = "") =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(w)}" stroke-opacity="${op}" stroke-linecap="square" ${extra}/>`;
const rect = (x, y, w, h, o = {}) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${o.rx ?? 0}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 2}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""} ${o.op != null ? `opacity="${o.op}"` : ""}/>`;
const circle = (cx, cy, r, o = {}) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 2}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""} ${o.op != null ? `opacity="${o.op}"` : ""}/>`;
const poly = (pts, o = {}) =>
  `<polyline points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? INK}" stroke-width="${o.sw ?? 2}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""} stroke-linejoin="round" stroke-linecap="round" ${o.op != null ? `opacity="${o.op}"` : ""}/>`;
const polygon = (pts, fill = INK, op = 1) =>
  `<polygon points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}" fill="${fill}" opacity="${op}"/>`;
const cross = (x, y, s = 10, stroke = INK, w = 1.6) =>
  line(x - s, y, x + s, y, stroke, w) + line(x, y - s, x, y + s, stroke, w);
/** Corner brackets used as a detection box. */
const bracket = (x, y, w, h, t = 14, stroke = BLUE, sw = 2.6) =>
  [
    `M${f(x)} ${f(y + t)}V${f(y)}H${f(x + t)}`,
    `M${f(x + w - t)} ${f(y)}H${f(x + w)}V${f(y + t)}`,
    `M${f(x + w)} ${f(y + h - t)}V${f(y + h)}H${f(x + w - t)}`,
    `M${f(x + t)} ${f(y + h)}H${f(x)}V${f(y + h - t)}`,
  ]
    .map((d) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="square"/>`)
    .join("");

/** Shared frame: paper, blueprint grid, ruler ticks, crop marks. */
function frame(inner) {
  let ticks = "";
  for (let x = 40; x < 1200; x += 40) ticks += line(x, 0, x, x % 200 === 0 ? 14 : 7, INK, 1.2, 0.45);
  for (let y = 40; y < 800; y += 40) ticks += line(0, y, y % 200 === 0 ? 14 : 7, y, INK, 1.2, 0.45);
  const m = 26;
  const crop = [
    [m, m, 1, 1],
    [1200 - m, m, -1, 1],
    [m, 800 - m, 1, -1],
    [1200 - m, 800 - m, -1, -1],
  ]
    .map(([x, y, dx, dy]) => line(x, y, x + 22 * dx, y, INK, 1.6, 0.6) + line(x, y, x, y + 22 * dy, INK, 1.6, 0.6))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img">
<defs>
<pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${INK}" stroke-opacity=".07" stroke-width="1"/></pattern>
<pattern id="G" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="${INK}" stroke-opacity=".13" stroke-width="1"/></pattern>
</defs>
<rect width="1200" height="800" fill="${PAPER}"/>
<rect width="1200" height="800" fill="url(#g)"/>
<rect width="1200" height="800" fill="url(#G)"/>
${ticks}
${inner}
${crop}
</svg>
`;
}

// ---- 1. SafeTrack: undercarriage rail inspection ------------------------------
function safetrack(r) {
  const VPx = 600;
  const VPy = 250;
  const H = 800;
  const k = (y) => (y - VPy) / (H - VPy);
  // the track curves toward the viewer, so it reads as rail, not as a pyramid
  const bend = (y) => 110 * k(y) ** 2.4;
  const xl = (y) => VPx - 400 * k(y) + bend(y);
  const xr = (y) => VPx + 400 * k(y) + bend(y);
  let s = circle(VPx, VPy, 120, { stroke: INK3, dash: "5 7", sw: 1.5 }) + circle(VPx, VPy, 64, { stroke: INK3, dash: "3 6", sw: 1.5 });

  const ties = [];
  for (let i = 1; i <= 26; i++) {
    const y = VPy + (H - VPy) * Math.pow(i / 26, 1.85);
    ties.push(y);
    const kk = k(y);
    const ext = 34 * kk + 6;
    s += line(xl(y) - ext, y, xr(y) + ext, y, INK, 1 + kk * 5, 0.8);
  }
  // each rail is a thin tapered ribbon following the curve
  const ribbon = (fx) => {
    const left = [];
    const right = [];
    for (let y = VPy; y <= H; y += 10) {
      const hw = 1.2 + 8.5 * k(y);
      left.push([fx(y) - hw, y]);
      right.push([fx(y) + hw, y]);
    }
    return polygon([...left, ...right.reverse()], INK);
  };
  s += ribbon(xl) + ribbon(xr);

  // scan band
  s += rect(0, 548, 1200, 74, { fill: BLUE, op: 0.09 }) + line(0, 585, 1200, 585, BLUE, 2.4);
  s += cross(VPx, VPy, 13, INK, 1.8) + circle(VPx, VPy, 5, { fill: INK });

  // detections along the rails
  for (const i of [10, 16, 21]) {
    const y = ties[i];
    const kk = k(y);
    const side = i % 2 ? xl(y) : xr(y);
    const w = 96 * kk + 44;
    const h = 54 * kk + 26;
    s += bracket(side - w / 2, y - h / 2, w, h);
    s += rect(side - w / 2, y - h / 2 - 14, 12, 10, { fill: BLUE });
  }

  // sensor readout
  for (let i = 0; i < 30; i++) {
    const h = 10 + r() * 46;
    s += rect(60 + i * 37, 774 - h, 5, h, { fill: h > 48 ? BLUE : INK, op: h > 48 ? 1 : 0.7 });
  }
  return s;
}

// ---- 2. ReservENSAM: weekly booking matrix ----------------------------------
function reservensam(r) {
  const x0 = 170;
  const y0 = 130;
  const cw = 145;
  const rh = 56;
  const cols = 6;
  const rows = 10;
  let s = "";
  for (let i = 0; i <= cols; i++) s += line(x0 + i * cw, y0, x0 + i * cw, y0 + rows * rh, INK, 1.2, 0.3);
  for (let j = 0; j <= rows; j++) s += line(x0, y0 + j * rh, x0 + cols * cw, y0 + j * rh, INK, 1.2, j % 2 ? 0.16 : 0.3);
  for (let i = 0; i < cols; i++) s += rect(x0 + i * cw + 10, y0 - 34, cw - 20, 10, { fill: INK, op: i === 2 ? 1 : 0.55 });
  for (let j = 0; j < rows; j++) s += line(x0 - (j % 2 ? 10 : 22), y0 + j * rh + rh / 2, x0 - 4, y0 + j * rh + rh / 2, INK, 1.6, 0.6);

  const taken = [];
  const free = [];
  for (let c = 0; c < cols; c++) {
    let j = Math.floor(r() * 2);
    while (j < rows - 1) {
      const len = 1 + Math.floor(r() * 3);
      if (j + len > rows) break;
      taken.push({ c, j, len });
      j += len + 1 + Math.floor(r() * 2);
    }
    if (j < rows - 1) free.push({ c, j, len: 1 });
  }
  taken.forEach((t, n) => {
    const x = x0 + t.c * cw + 8;
    const y = y0 + t.j * rh + 7;
    const w = cw - 16;
    const h = t.len * rh - 14;
    if (n % 7 === 3) s += rect(x, y, w, h, { fill: BLUE, rx: 6 });
    else if (n % 7 === 5) s += rect(x, y, w, h, { fill: "none", stroke: INK, rx: 6, sw: 2 }) + line(x + 8, y + 8, x + w - 8, y + h - 8, INK, 1.2, 0.35);
    else s += rect(x, y, w, h, { fill: INK, rx: 6, op: 0.92 });
  });
  const g = free[Math.min(2, free.length - 1)] ?? { c: 3, j: 6 };
  const gx = x0 + g.c * cw + 8;
  const gy = y0 + g.j * rh + 7;
  s += rect(gx, gy, cw - 16, rh * 2 - 14, { stroke: BLUE, dash: "7 6", rx: 6, sw: 2.4 });
  s += cross(gx + (cw - 16) / 2, gy + rh - 7, 11, BLUE, 2.4);

  const nowX = x0 + 3.62 * cw;
  s += line(nowX, y0 - 22, nowX, y0 + rows * rh + 20, BLUE, 2.2) + circle(nowX, y0 - 22, 6, { fill: BLUE });
  return s;
}

// ---- 3. AI Health Assistant: chat + retrieval graph -------------------------
function health(r) {
  let s = "";
  const bubbles = [
    { side: "u", w: 230, h: 56, y: 130 },
    { side: "a", w: 330, h: 112, y: 214 },
    { side: "u", w: 190, h: 56, y: 356 },
    { side: "a", w: 360, h: 140, y: 440 },
    { side: "u", w: 250, h: 56, y: 608 },
  ];
  for (const b of bubbles) {
    const x = b.side === "u" ? 500 - b.w : 90;
    if (b.side === "a") {
      s += rect(x, b.y, b.w, b.h, { fill: INK, rx: 14 });
      const lines = Math.floor((b.h - 30) / 22) + 1;
      for (let i = 0; i < lines; i++) s += rect(x + 20, b.y + 20 + i * 22, (b.w - 40) * (i === lines - 1 ? 0.55 : 1), 8, { fill: PAPER, rx: 4, op: 0.85 });
    } else {
      s += rect(x, b.y, b.w, b.h, { stroke: INK, rx: 14, sw: 2.2 });
      s += rect(x + 20, b.y + 24, b.w - 40, 8, { fill: INK, rx: 4, op: 0.7 });
    }
  }
  // retrieval graph
  for (let i = 0; i < 170; i++) s += circle(560 + r() * 560, 110 + r() * 520, 1.7, { fill: INK, op: 0.22 });
  const q = [640, 390];
  const docs = Array.from({ length: 8 }, (_, i) => {
    const a = -1.05 + (i / 7) * 2.1;
    return [q[0] + 230 + Math.cos(a) * 55 + r() * 20, q[1] + Math.sin(a) * 250 + (r() - 0.5) * 30, 9 + r() * 9];
  });
  const hit = new Set([1, 3, 6]);
  const ans = [1082, 390];
  docs.forEach((d, i) => {
    s += line(q[0], q[1], d[0], d[1], hit.has(i) ? BLUE : INK, hit.has(i) ? 2.4 : 1.2, hit.has(i) ? 1 : 0.28);
    if (hit.has(i)) s += line(d[0], d[1], ans[0], ans[1], BLUE, 2.4);
  });
  docs.forEach((d, i) => {
    s += circle(d[0], d[1], d[2], { fill: hit.has(i) ? BLUE : PAPER, stroke: hit.has(i) ? BLUE : INK, sw: 2 });
  });
  s += circle(q[0], q[1], 22, { fill: BLUE }) + cross(q[0], q[1], 9, PAPER, 2.2);
  s += rect(ans[0] - 20, ans[1] - 20, 40, 40, { fill: INK, rx: 6 });
  // vital line
  const pts = [];
  for (let x = 560; x <= 1120; x += 8) {
    const phase = (x - 560) % 140;
    const y = phase > 60 && phase < 80 ? 700 - Math.sin(((phase - 60) / 20) * Math.PI) * 52 : phase > 80 && phase < 92 ? 700 + 22 : 700;
    pts.push([x, y]);
  }
  s += poly(pts, { stroke: BLUE, sw: 2.6 });
  return s;
}

// ---- 4. MLOps Emotion Detection: landmarks + loss curve + pipeline ----------
function mlops(r) {
  let s = "";
  const cx = 330;
  const cy = 310;
  const sc = 178;
  const P = (x, y) => [cx + x * sc, cy + y * sc];
  const groups = [];
  const jaw = Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI * (0.02 + (i / 16) * 0.96);
    return P(Math.cos(a) * -0.82 * -1, 0.2 + Math.sin(a) * 0.84);
  });
  groups.push(jaw);
  // eyebrows: a short arch on each side of the midline
  const brow = (dir) =>
    Array.from({ length: 5 }, (_, i) => [cx + dir * (0.1 + i * 0.17) * sc, cy + (-0.38 - Math.sin((i / 4) * Math.PI) * 0.07) * sc]);
  groups.push(brow(-1), brow(1));
  const eye = (ex) => Array.from({ length: 6 }, (_, i) => P(ex + Math.cos((i / 6) * Math.PI * 2) * 0.17, -0.18 + Math.sin((i / 6) * Math.PI * 2) * 0.075));
  groups.push(eye(-0.38), eye(0.38));
  groups.push(Array.from({ length: 5 }, (_, i) => P(0, -0.2 + i * 0.11)));
  groups.push(Array.from({ length: 12 }, (_, i) => P(Math.cos((i / 12) * Math.PI * 2) * 0.3, 0.52 + Math.sin((i / 12) * Math.PI * 2) * 0.1)));
  for (const g of groups) {
    s += poly(g, { stroke: INK, sw: 1.3, op: 0.5 });
    for (const [x, y] of g) s += circle(x, y, 3.4, { fill: INK });
  }
  s += bracket(cx - 0.98 * sc, cy - 0.62 * sc, 1.96 * sc, 1.9 * sc, 22);
  s += rect(cx - 0.98 * sc, cy - 0.62 * sc - 16, 14, 11, { fill: BLUE });
  // loss curves
  const ax = 640;
  const ay = 120;
  const aw = 470;
  const ah = 290;
  for (let i = 0; i <= 5; i++) s += line(ax, ay + (i * ah) / 5, ax + aw, ay + (i * ah) / 5, INK, 1, 0.16);
  s += line(ax, ay, ax, ay + ah, INK, 2) + line(ax, ay + ah, ax + aw, ay + ah, INK, 2);
  const train = [];
  const val = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const base = 0.9 * Math.exp(-3.2 * t) + 0.08;
    train.push([ax + t * aw, ay + ah - (1 - base) * ah * 0.92 - 4 + (r() - 0.5) * 7]);
    val.push([ax + t * aw, ay + ah - (1 - (base + 0.06 + 0.05 * t)) * ah * 0.92 - 4 + (r() - 0.5) * 11]);
  }
  s += poly(train, { stroke: INK, sw: 2.6 }) + poly(val, { stroke: BLUE, sw: 2.6, dash: "9 7" });
  // pipeline
  const labels = [0, 1, 2, 3];
  const bw = 190;
  const by = 580;
  labels.forEach((i) => {
    const x = 90 + i * 262;
    s += rect(x, by, bw, 92, { fill: i === 2 ? BLUE : "none", stroke: i === 2 ? BLUE : INK, rx: 12, sw: 2.4 });
    s += rect(x + 22, by + 26, bw - 44, 9, { fill: i === 2 ? PAPER : INK, rx: 4, op: 0.9 }) + rect(x + 22, by + 50, (bw - 44) * 0.6, 9, { fill: i === 2 ? PAPER : INK, rx: 4, op: 0.5 });
    if (i < 3) s += line(x + bw + 8, by + 46, x + 262 - 12, by + 46, INK, 2.4) + polygon([[x + 262 - 8, by + 46], [x + 262 - 20, by + 38], [x + 262 - 20, by + 54]], INK);
  });
  for (let i = 0; i < 3; i++) s += rect(90 + 2 * 262 + 20 + i * 52, by + 108, 40, 14, { stroke: BLUE, rx: 4, sw: 1.8 });
  return s;
}

// ---- 5. MEDACCESS: secured data hub ---------------------------------------
function medaccess(r) {
  let s = "";
  const cx = 600;
  const cy = 380;
  s += circle(cx, cy, 190, { stroke: INK3, dash: "5 7", sw: 1.5 }) + circle(cx, cy, 285, { stroke: INK3, dash: "3 8", sw: 1.5 });
  const nodes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.2;
    const rad = i % 2 ? 285 : 190;
    nodes.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.88, i]);
  }
  for (const [x, y] of nodes) {
    s += line(cx, cy, x, y, INK, 1.4, 0.32);
    const t = 0.3 + r() * 0.5;
    s += circle(cx + (x - cx) * t, cy + (y - cy) * t, 5, { fill: BLUE });
  }
  for (const [x, y, i] of nodes) {
    if (i % 2) s += circle(x, y, 22, { fill: PAPER, stroke: INK, sw: 2.4 }) + circle(x, y, 7, { fill: INK });
    else s += rect(x - 24, y - 24, 48, 48, { fill: PAPER, stroke: INK, rx: 6, sw: 2.4 }) + line(x - 12, y, x + 12, y, INK, 3) + line(x, y - 12, x, y + 12, INK, 3);
  }
  const hex = Array.from({ length: 7 }, (_, i) => [cx + Math.cos((i / 6) * Math.PI * 2 + Math.PI / 6) * 118, cy + Math.sin((i / 6) * Math.PI * 2 + Math.PI / 6) * 118]);
  s += polygon(hex.slice(0, 6), PAPER) + poly(hex, { stroke: INK, sw: 4 });
  s += rect(cx - 16, cy - 56, 32, 112, { fill: BLUE, rx: 4 }) + rect(cx - 56, cy - 16, 112, 32, { fill: BLUE, rx: 4 });
  // token chip
  s += rect(380, 684, 150, 38, { fill: BLUE, rx: 19 }) + rect(540, 684, 130, 38, { fill: INK, rx: 19 }) + rect(680, 684, 140, 38, { fill: INK, rx: 19, op: 0.45 });
  s += circle(398, 703, 7, { fill: PAPER }) + circle(552, 703, 4, { fill: PAPER }) + circle(693, 703, 4, { fill: PAPER });
  return s;
}

// ---- 6. Pyramid: layered ledger, web + mobile ------------------------------
function pyramid(r) {
  let s = "";
  const cx = 400;
  const layers = 7;
  for (let i = 0; i < layers; i++) {
    const w = 90 + i * 92;
    const y = 130 + i * 76;
    const top = i === 0;
    s += rect(cx - w / 2, y, w, 58, { fill: top ? BLUE : i % 2 ? "none" : INK, stroke: top ? BLUE : INK, rx: 5, sw: 2.4 });
    if (i % 2 && !top) s += line(cx - w / 2 + 14, y + 29, cx + w / 2 - 14, y + 29, INK, 1.4, 0.4, 'stroke-dasharray="4 5"');
    const x1 = cx + w / 2 + 14;
    s += line(x1, y + 29, 760, y + 29, INK, 1.2, 0.3, 'stroke-dasharray="3 6"');
    s += rect(780 - (top ? 0 : 0), y + 19, 20 + r() * 70, 20, { fill: top ? BLUE : INK, rx: 4, op: top ? 1 : 0.7 });
  }
  s += line(cx, 108, cx, 690, INK, 1, 0.2, 'stroke-dasharray="2 6"');
  // phone
  const px = 930;
  const py = 160;
  s += rect(px, py, 190, 430, { fill: PAPER, stroke: INK, rx: 28, sw: 3.4 }) + rect(px + 62, py + 14, 66, 9, { fill: INK, rx: 4.5 });
  s += polygon([[px + 95, py + 64], [px + 130, py + 124], [px + 60, py + 124]], BLUE);
  for (let i = 0; i < 5; i++) {
    const y = py + 160 + i * 46;
    s += rect(px + 22, y, 146, 32, { stroke: INK, rx: 8, sw: 1.8, op: 0.6 }) + rect(px + 34, y + 12, 30 + r() * 60, 8, { fill: INK, rx: 4, op: 0.6 });
  }
  s += rect(px + 62, py + 404, 66, 8, { fill: INK, rx: 4, op: 0.4 });
  return s;
}

const figures = { safetrack, reservensam, "health-assistant": health, "mlops-emotion": mlops, medaccess, pyramid };
for (const [name, draw] of Object.entries(figures)) {
  const svg = frame(draw(rng(seedOf(name))));
  fs.writeFileSync(path.join(figDir, `${name}.svg`), svg);
  console.log(`✓ public/figures/${name}.svg  (${(svg.length / 1024).toFixed(1)} KB)`);
}

// ---- favicon + touch icon -----------------------------------------------------
const markSvg = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
<rect width="32" height="32" rx="7" fill="${bg}"/>
<g fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="square"><circle cx="16" cy="16" r="9.5"/><path d="M16 3v9M16 20v9M3 16h9M20 16h9"/></g>
<circle cx="16" cy="16" r="2.4" fill="${BLUE}"/>
</svg>
`;
fs.writeFileSync(path.join(root, "src", "app", "icon.svg"), markSvg(PAPER));
await sharp(Buffer.from(markSvg(PAPER)), { density: 900 }).resize(180, 180).png().toFile(path.join(root, "src", "app", "apple-icon.png"));
console.log("✓ src/app/icon.svg, src/app/apple-icon.png");
