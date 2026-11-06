"use client";

import { useEffect, useRef } from "react";
import { MOTION_AND_POINTER } from "@/lib/env";
import styles from "./Plate.module.css";

type Props = {
  src: string;
  alt: string;
  /** Figure number shown as a caption chip, e.g. "01". */
  fig?: string;
  ratio?: string;
  priority?: boolean;
  objectPosition?: string;
  /** Pointer distortion (hover-capable, motion-allowed devices only). */
  interactive?: boolean;
  /** "cover" fills the frame; "contain" shows the whole image (screenshots). */
  fit?: "cover" | "contain";
  /** Tonal black & white treatment, applied identically to the image and the WebGL texture. */
  gray?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * A "specimen plate": a framed figure. The WebGL distortion module is only
 * downloaded on the first hover, from a hover-capable device that allows motion;
 * everywhere else this is a plain, fast <img>. The canvas never takes pointer
 * events, so a link wrapped around the plate stays fully clickable.
 */
export function Plate({
  src,
  alt,
  fig,
  ratio = "3 / 2",
  priority = false,
  objectPosition = "50% 50%",
  interactive = true,
  fit = "cover",
  gray = false,
  width = 1200,
  height = 800,
  className = "",
}: Props) {
  const plate = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // "contain" frames show the whole image, which the cover-fit shader would crop: no distortion.
    if (!interactive || fit === "contain") return;
    const el = plate.current;
    const image = img.current;
    if (!el || !image) return;
    const host = el.closest<HTMLElement>("[data-plate-host]") ?? el;
    const mq = window.matchMedia(MOTION_AND_POINTER);
    if (!mq.matches) return;

    let fx: import("@/lib/distortion").Distortion | null = null;
    let active = false;
    const norm = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] as const;
    };
    const enter = async (e: PointerEvent) => {
      if (e.pointerType === "touch" || !mq.matches) return;
      active = true;
      const mod = await import("@/lib/distortion");
      if (!active) return;
      fx = mod.getDistortion();
      if (fx?.attach(el, image)) {
        const [x, y] = norm(e);
        fx.move(x, y);
      }
    };
    const move = (e: PointerEvent) => {
      if (!fx || !active) return;
      const [x, y] = norm(e);
      fx.move(x, y);
    };
    const leave = () => {
      active = false;
      fx?.release();
    };

    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      active = false;
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      fx?.release();
    };
  }, [interactive, fit]);

  return (
    <div
      ref={plate}
      className={`${styles.plate} ${className}`}
      style={{ aspectRatio: ratio }}
      data-gray={gray ? "" : undefined}
    >
      {/* Pre-sized static SVG/WebP: next/image's optimiser is unavailable in a static export. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        style={{ objectPosition, objectFit: fit, filter: gray ? "grayscale(1) contrast(1.06)" : undefined }}
      />
      {fig ? (
        <span className={`mono ${styles.fig}`} aria-hidden="true">
          Fig. {fig}
        </span>
      ) : null}
    </div>
  );
}
