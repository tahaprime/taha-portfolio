import { coverOf, type Project } from "@/content/projects";
import { Reveal } from "@/components/fx/Reveal";
import { Plate } from "@/components/fx/Plate";
import { TransitionLink } from "@/components/shell/TransitionLink";
import { Arrow } from "@/components/shell/Arrow";
import styles from "./ProjectCard.module.css";

export const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Whole-card link via a stretched pseudo-element on the title link (so the link's
 * accessible name is just the project title), while the card itself hosts the
 * pointer listeners for the image distortion. The plate is decorative here.
 */
export function ProjectCard({ project: p, ratio, priority = false }: { project: Project & { index: number }; ratio: string; priority?: boolean }) {
  const cover = coverOf(p);
  return (
    <Reveal as="article" mode="fade" className={styles.card} data-plate-host="">
      <Plate src={cover.src} alt="" fig={cover.generated ? pad(p.index) : undefined} ratio={ratio} priority={priority} fit="cover" />
      <div className={styles.meta}>
        <span className="mono muted">Project /{pad(p.index)}</span>
        <span className="mono muted">{p.tags.join(" — ")}</span>
      </div>
      <h3 className={styles.title}>
        <TransitionLink href={`/projects/${p.slug}/`} className={styles.link}>
          {p.title}
          <span className="sr-only">: {p.subtitle}</span>
        </TransitionLink>
        <Arrow className={styles.arrow} />
      </h3>
    </Reveal>
  );
}
