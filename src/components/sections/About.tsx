import { site } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";
import { Plate } from "@/components/fx/Plate";
import styles from "./About.module.css";

export function About() {
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
              src="/portrait.webp"
              alt={`Portrait of ${site.name}`}
              ratio="4 / 5"
              width={960}
              height={1200}
              objectPosition="50% 20%"
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
              {site.stats.map((s) => (
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
