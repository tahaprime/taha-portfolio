"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { DURATION, EASE } from "@/lib/motion";
import { useMotion } from "./MotionProvider";
import { Mark } from "./Mark";
import styles from "./Loader.module.css";

/**
 * "Boot log" loader. Unlike a fake timer it tracks real readiness (web fonts +
 * window load, with a 4.5 s ceiling), lasts at least DURATION.bootMin, and is shown
 * once per session, only when JS is on and motion is allowed (the head script adds
 * `html.show-loader`; without it this component renders nothing visible).
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const log = useRef<HTMLUListElement>(null);
  const { bootDone } = useMotion();

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("show-loader")) return;

    let cancelled = false;
    let raf = 0;
    let ready = false;
    let progress = 0;
    const t0 = performance.now();
    const min = DURATION.bootMin * 1000;
    const steps = [20, 55, 100];
    const items = Array.from(log.current?.querySelectorAll("li") ?? []);

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    void Promise.race([Promise.all([fonts, loaded]), new Promise((r) => setTimeout(r, 4500))]).then(() => {
      ready = true;
    });

    const leave = () => {
      gsap
        .timeline({
          onComplete: () => {
            html.classList.remove("show-loader");
            try {
              sessionStorage.setItem("boot", "1");
            } catch {
              /* private mode: the loader may simply show again next visit */
            }
          },
        })
        .to(root.current, { yPercent: -100, duration: 0.8, ease: EASE.inOut, delay: 0.25 })
        .call(bootDone, [], 0.55);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const t = now - t0;
      const target = ready && t >= min ? 100 : Math.min(94, (t / min) * 94);
      progress += (target - progress) * 0.14;
      if (target === 100 && progress > 99.4) progress = 100;
      const p = Math.round(progress);
      if (digits.current) digits.current.textContent = String(p).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${progress / 100})`;
      items.forEach((li, i) => li.setAttribute("data-on", String(p >= steps[i])));
      if (progress >= 100) leave();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [bootDone]);

  return (
    <div ref={root} className={`loader ${styles.loader}`} aria-hidden="true">
      <div className={styles.frame}>
        <p className={`mono ${styles.top}`}>
          <Mark size={22} />
          <span>Taha Hoummadi / Portfolio</span>
          <span>Boot</span>
        </p>
        <div className={styles.center}>
          <p className={styles.digits}>
            <span ref={digits}>000</span>
            <small>%</small>
          </p>
          <span className={styles.track}>
            <span ref={bar} className={styles.bar} />
          </span>
        </div>
        <ul ref={log} className={`mono ${styles.log}`}>
          <li>fonts</li>
          <li>layout</li>
          <li>ready</li>
        </ul>
      </div>
    </div>
  );
}
