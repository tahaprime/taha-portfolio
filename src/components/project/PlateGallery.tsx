"use client";

import { useRef, useState, type ReactNode } from "react";
import { motionAllowed } from "@/lib/env";
import styles from "./PlateGallery.module.css";

type Slide = { id: string; label: string; node: ReactNode };

/**
 * Horizontal figure strip: native scroll-snap (touch, trackpad, keyboard arrows) plus
 * previous / next buttons. Deliberately not WebGL: it is lighter, fully accessible and
 * keeps native momentum.
 */
export function PlateGallery({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const go = (to: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, to));
    const slide = el.children[clamped] as HTMLElement | undefined;
    if (!slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: motionAllowed() ? "smooth" : "auto" });
  };

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const step = first ? first.getBoundingClientRect().width + 20 : el.clientWidth;
    setIndex(Math.round(el.scrollLeft / step));
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={styles.gallery}>
      <ul
        ref={track}
        className={styles.track}
        tabIndex={0}
        aria-label="Project figures, scrollable"
        onScroll={onScroll}
        data-lenis-prevent-wheel=""
      >
        {slides.map((s) => (
          <li key={s.id} className={styles.slide} data-plate-host="">
            <figure>
              {s.node}
              <figcaption className="mono muted">{s.label}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {slides.length > 1 ? (
        <div className={styles.controls}>
          <button type="button" className="mono" onClick={() => go(index - 1)} disabled={index === 0}>
            <span aria-hidden="true">←</span> Prev<span className="sr-only"> figure</span>
          </button>
          <span className="mono muted" aria-live="polite">
            {pad(index + 1)} / {pad(slides.length)}
          </span>
          <button
            type="button"
            className="mono"
            onClick={() => go(index + 1)}
            disabled={index >= slides.length - 1}
          >
            Next<span className="sr-only"> figure</span> <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
