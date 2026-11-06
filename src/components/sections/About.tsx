import { site } from "@/content/site";
import { competitions, experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/fx/Reveal";
import { Plate } from "@/components/fx/Plate";
import styles from "./About.module.css";

/** Headline figures are computed from the content files, so they can never go stale. */
function stats() {
  const nComp: number = competitions.length;
  const internships = experience.filter((e) => /intern/i.test(e.role)).length;
  return [
    ...(internships ? [{ value: String(internships), label: internships === 1 ? "Internship" : "Internships" }] : []),
    { value: String(projects.length), label: projects.length === 1 ? "Project" : "Projects" },
    ...(nComp ? [{ value: String(nComp), label: nComp === 1 ? "Competition" : "Competitions" }] : []),
  ];
}

export function About() {
  const { portrait } = site;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <hr className="rule" />
        <div className={`grid12 ${styles.grid}`}>
          <p className={`mono eyebrow ${styles.eyebrow}`}>
            <b>01</b> / About
          </p>

          <Reveal mode="fade" className={styles.portrait} data-plate-host="">
            <Plate
              src={portrait.src}
              alt={portrait.alt}
              ratio="4 / 5"
              width={900}
              height={1125}
              objectPosition={portrait.position}
              gray={portrait.treatment === "mono"}
            />
          </Reveal>

          <div className={styles.copy}>
            <h2 id="about-title" className={`serif ${styles.quote}`}>
              <Reveal as="span" mode="scramble">
                {site.tagline}
              </Reveal>
            </h2>

            {site.about.map((p, i) => (
              <Reveal key={i} as="p" mode="flicker" className="lead" delay={i * 0.1}>
                {p}
              </Reveal>
            ))}

            <dl className={styles.stats}>
              {stats().map((s) => (
                <div key={s.label}>
                  <dt className="mono muted">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mono muted">
              Languages —{" "}
              {site.languages.map((l, i) => (
                <span key={l.name}>
                  {i > 0 ? " · " : ""}
                  {l.name} ({l.level})
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
