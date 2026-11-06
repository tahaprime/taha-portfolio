"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motionAllowed } from "@/lib/env";
import { getLenis, scrollToTarget } from "@/lib/scroll";
import { DURATION, EASE, GLYPHS, normalizePath } from "@/lib/motion";
import styles from "./Curtain.module.css";

type MotionContextValue = {
  /** True once page-level animations may start (after the loader / during the reveal). */
  ready: boolean;
  /** Navigate with the curtain (falls back to a plain navigation when motion is off). */
  navigate: (href: string) => void;
  /** Called by the loader when it starts leaving. */
  bootDone: () => void;
};

const MotionContext = createContext<MotionContextValue>({
  ready: true,
  navigate: () => {},
  bootDone: () => {},
});

export const useMotion = () => useContext(MotionContext);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (i: number) => (i <= 0 ? resolve() : requestAnimationFrame(() => step(i - 1)));
    step(n);
  });

/** Hard ceiling for a route change before we give up on the curtain and navigate natively. */
const NAVIGATION_TIMEOUT_MS = 4500;

export function MotionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Lazy initial value: pages may animate immediately unless the once-per-session loader is
  // showing (the head script adds `html.show-loader`). Not rendered into markup, so SSR-safe.
  const [ready, setReady] = useState(
    () => typeof document !== "undefined" && !document.documentElement.classList.contains("show-loader"),
  );
  const busy = useRef(false);
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const waiter = useRef<{ path: string; resolve: (ok: boolean) => void } | null>(null);

  // Tell the head script's failsafe that hydration happened.
  useEffect(() => {
    (window as unknown as { __ready?: boolean }).__ready = true;
  }, []);

  // Resolve a pending curtain navigation once the router has committed the new path.
  useEffect(() => {
    const w = waiter.current;
    if (w && normalizePath(pathname) === w.path) {
      waiter.current = null;
      w.resolve(true);
    }
  }, [pathname]);

  // New layout → recompute scroll triggers.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [ready, pathname]);

  const bootDone = useCallback(() => setReady(true), []);

  const cover = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        const c = curtain.current;
        const l = label.current;
        if (!c || !l) return resolve();
        l.textContent = text;
        gsap.set(c, { yPercent: 100, autoAlpha: 1 });
        gsap.set(l, { opacity: 0 });
        gsap
          .timeline({ onComplete: resolve })
          .to(c, { yPercent: 0, duration: DURATION.curtainCover, ease: EASE.inOut })
          .to(l, { opacity: 1, duration: 0.2 }, "-=0.2")
          .to(l, { duration: 0.4, scrambleText: { text, chars: GLYPHS, speed: 0.8 } }, "<");
      }),
    [],
  );

  const reveal = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const c = curtain.current;
        const l = label.current;
        if (!c || !l) return resolve();
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(c, { autoAlpha: 0, yPercent: 100 });
              resolve();
            },
          })
          .to(l, { opacity: 0, duration: 0.15 })
          .to(c, { yPercent: -100, duration: DURATION.curtainReveal, ease: EASE.inOut }, "<");
      }),
    [],
  );

  const navigate = useCallback(
    async (href: string) => {
      if (busy.current) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        window.location.assign(href);
        return;
      }
      if (url.origin !== window.location.origin) {
        window.location.assign(href);
        return;
      }

      const here = normalizePath(window.location.pathname);
      const there = normalizePath(url.pathname);

      // Same page: just scroll.
      if (here === there) {
        if (url.hash) {
          window.history.pushState(null, "", url.pathname + url.hash);
          scrollToTarget(url.hash);
        } else {
          scrollToTarget(0);
        }
        return;
      }

      // No motion (reduced-motion / curtain unavailable): plain client navigation.
      if (!motionAllowed() || !curtain.current || !label.current) {
        router.push(href);
        return;
      }

      busy.current = true;
      setReady(false);
      getLenis()?.stop();
      try {
        await cover(`→ ${there}`);
        const arrived = new Promise<boolean>((resolve) => {
          waiter.current = { path: there, resolve };
        });
        router.push(href);
        const ok = await Promise.race([arrived, sleep(NAVIGATION_TIMEOUT_MS).then(() => false)]);
        waiter.current = null;
        if (!ok) {
          // The router never committed: fall back to a real navigation so the user is never stuck.
          window.location.assign(href);
          return;
        }
        if (!url.hash) scrollToTarget(0, true);
        document.getElementById("main")?.focus({ preventScroll: true });
        await frames(2);
        setReady(true);
        getLenis()?.start();
        await reveal();
      } finally {
        busy.current = false;
        getLenis()?.start();
      }
    },
    [cover, reveal, router],
  );

  const value = useMemo(() => ({ ready, navigate, bootDone }), [ready, navigate, bootDone]);

  return (
    <MotionContext.Provider value={value}>
      {children}
      <div ref={curtain} className={styles.curtain} aria-hidden="true">
        <p ref={label} className={`mono ${styles.label}`} />
      </div>
    </MotionContext.Provider>
  );
}
