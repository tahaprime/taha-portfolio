"use client";

import { useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, motionAllowed } from "@/lib/env";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Plate } from "@/components/fx/Plate";
import { TransitionLink } from "@/components/shell/TransitionLink";
import { Arrow } from "@/components/shell/Arrow";
import { pad } from "./ProjectCard";
import styles from "./ProjectIndex.module.css";

/**
 * Title list. On hover (or keyboard focus) the other rows dim and a cluster of three
 * pieces scatters in behind the cursor: the cover plate, a detail crop and a spec card.
 * Hover-capable devices only; touch users simply get the list.
 */
export function ProjectIndex({ items }: { items: Project[] }) {
  const [active, setActive] = useState<string | null>(null);
  // Last project shown: kept after the pointer leaves so the cluster can fade out with its content.
  const [shownSlug, setShownSlug] = useState<string | null>(null);
  const canHover = useMediaQuery(FINE_POINTER);
  const preview = useRef<HTMLDivElement>(null);
  const shown = items.find((p) => p.slug === shownSlug) ?? null;

  const activate = (slug: string) => {
    setActive(slug);
    setShownSlug(slug);
  };

  useGSAP(
    () => {
      const root = preview.current;
      if (!root) return;
      const nodes = root.querySelectorAll("[data-pv]");
      if (!nodes.length) return;
      const motion = motionAllowed();
      if (!active) {
        gsap.to(nodes, { opacity: 0, scale: 0.9, duration: motion ? 0.25 : 0.01, ease: "power3.out", overwrite: true });
        return;
      }
      gsap.fromTo(
        nodes,
        { opacity: 0, scale: motion ? 0.6 : 1, y: motion ? 24 : 0 },
        { opacity: 1, scale: 1, y: 0, duration: motion ? 0.6 : 0.01, stagger: motion ? 0.07 : 0, ease: "expo.out", overwrite: true },
      );
    },
    { scope: preview, dependencies: [active, shown?.slug] },
  );

  return (
    <>
      <ul className={styles.list}>
        {items.map((p) => (
          <li
            key={p.slug}
            className={styles.row}
            data-active={active === p.slug ? "" : undefined}
            onPointerEnter={(e) => canHover && e.pointerType !== "touch" && activate(p.slug)}
            onPointerLeave={() => setActive(null)}
            onFocus={(e) => e.target.matches(":focus-visible") && activate(p.slug)}
            onBlur={() => setActive(null)}
          >
            <span className={`mono muted ${styles.idx}`}>/{pad(p.index)}</span>
            <h2 className={styles.title}>
              <TransitionLink href={`/projects/${p.slug}/`} className={styles.link}>
                {p.title}
                <span className="sr-only">: {p.subtitle}</span>
              </TransitionLink>
            </h2>
            <span className={`mono muted ${styles.tags}`}>{p.tags.join(" — ")}</span>
            <Arrow className={styles.arrow} />
          </li>
        ))}
      </ul>

      {canHover ? (
        <div ref={preview} className={styles.preview} aria-hidden="true">
          {shown ? (
            <>
              <div data-pv="" className={`${styles.pv} ${styles.pvA}`}>
                <Plate src={`/figures/${shown.figure}.svg`} alt="" ratio="4 / 3" interactive={false} />
              </div>
              <div data-pv="" className={`${styles.pv} ${styles.pvB}`}>
                <Plate
                  src={`/figures/${shown.figure}.svg`}
                  alt=""
                  ratio="1 / 1"
                  interactive={false}
                  objectPosition="72% 42%"
                  className={styles.zoom}
                />
              </div>
              <div data-pv="" className={`${styles.pv} ${styles.pvC}`}>
                <p className="mono muted">{shown.year ?? shown.status}</p>
                <p className={styles.spec}>{shown.stack.slice(0, 5).join(" · ")}</p>
                {shown.year ? <p className="mono faint">{shown.status}</p> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
