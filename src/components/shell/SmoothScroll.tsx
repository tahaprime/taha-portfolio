"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/env";
import { setLenis } from "@/lib/scroll";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and the
 * smoothed scroll position never disagree. The instance is created and ticked in
 * the same effect (no dependency on a wrapper's timing), and it is not created at
 * all when the visitor prefers reduced motion, so native scrolling is used instead.
 */
export function SmoothScroll() {
  const enabled = useMediaQuery(MOTION_OK);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, [enabled]);

  return null;
}
