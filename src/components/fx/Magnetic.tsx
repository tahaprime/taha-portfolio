"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_AND_POINTER } from "@/lib/env";

type Props = {
  children: ReactNode;
  /** Fraction of the cursor offset the element follows. */
  strength?: number;
  /** Pull radius as a multiple of the element's larger side. */
  radius?: number;
  className?: string;
};

/**
 * Elements drift toward a nearby cursor and spring back. Pointer devices with
 * hover only (never touch), and never under reduced motion: gated by
 * gsap.matchMedia, so it also tears itself down if the preference changes.
 */
export function Magnetic({ children, strength = 0.35, radius = 1.15, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_AND_POINTER, () => {
        const qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        let frame = 0;
        let px = 0;
        let py = 0;

        const update = () => {
          frame = 0;
          const r = el.getBoundingClientRect();
          // centre of the element's LAYOUT position (undo the current translation)
          const cx = r.left + r.width / 2 - Number(gsap.getProperty(el, "x"));
          const cy = r.top + r.height / 2 - Number(gsap.getProperty(el, "y"));
          const dx = px - cx;
          const dy = py - cy;
          const reach = Math.max(r.width, r.height) * radius;
          if (Math.hypot(dx, dy) < reach) {
            qx(dx * strength);
            qy(dy * strength);
          } else {
            qx(0);
            qy(0);
          }
        };
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          px = e.clientX;
          py = e.clientY;
          if (!frame) frame = requestAnimationFrame(update);
        };
        const reset = () => {
          qx(0);
          qy(0);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", reset);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", reset);
          if (frame) cancelAnimationFrame(frame);
          gsap.set(el, { x: 0, y: 0 });
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
