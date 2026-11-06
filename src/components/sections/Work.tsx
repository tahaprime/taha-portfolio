import { featuredProjects } from "@/content/projects";
import { Reveal } from "@/components/fx/Reveal";
import { ProjectCard } from "@/components/project/ProjectCard";
import { TransitionLink } from "@/components/shell/TransitionLink";
import styles from "./Work.module.css";

export function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="work-title" className="h2">
            <Reveal as="span" mode="scramble">
              Selected
            </Reveal>{" "}
            <em>work.</em>
          </h2>
          <p className="mono eyebrow">
            <b>02</b> / Projects
          </p>
        </div>

        <ul className={styles.grid}>
          {featuredProjects.map((p, i) => (
            <li key={p.slug} className={styles.item} data-i={i}>
              <ProjectCard project={p} ratio={p.ratio ?? "3 / 2"} priority={i < 2} />
            </li>
          ))}
        </ul>

        <p className={styles.all}>
          <TransitionLink href="/projects/" className="link mono">
            All projects →
          </TransitionLink>
        </p>
      </div>
    </section>
  );
}
