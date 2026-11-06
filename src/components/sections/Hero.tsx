import { site, socials } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";
import { Magnetic } from "@/components/fx/Magnetic";
import { TransitionLink } from "@/components/shell/TransitionLink";
import styles from "./Hero.module.css";

export function Hero() {
  const coords = `${site.location.lat.toFixed(4)}° N, ${Math.abs(site.location.lon).toFixed(4)}° W`;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <span className={styles.cross} data-pos="a" aria-hidden="true" />
      <span className={styles.cross} data-pos="b" aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.labels}>
          <Reveal as="p" mode="scramble" hold={false} className="mono muted">
            {site.positioning}
          </Reveal>
          <Reveal as="p" mode="scramble" hold={false} className="mono muted" delay={0.1}>
            {`${site.school.name} — ${site.school.track}`}
          </Reveal>
        </div>

        <Reveal as="p" mode="flicker" hold={false} className={styles.blurb} delay={0.2}>
          {site.blurb}
        </Reveal>

        <h1 id="hero-title" className={styles.title}>
          <span className="sr-only">
            {site.name}, {site.role}
          </span>
          <span className={styles.first} aria-hidden="true">
            <Reveal as="span" mode="scramble" hold={false} delay={0.05}>
              {site.firstName}
            </Reveal>
          </span>
          <span className={`display ${styles.last}`} aria-hidden="true">
            <Reveal as="span" mode="scramble" hold={false} delay={0.15}>
              {site.lastName}
            </Reveal>
          </span>
        </h1>

        <div className={styles.role}>
          <hr className={`rule ${styles.roleRule}`} />
          <Reveal as="p" mode="scramble" hold={false} className={styles.roleText} delay={0.3}>
            {site.role}
          </Reveal>
        </div>

        <div className={styles.foot}>
          <Reveal as="p" mode="fade" start="top bottom" className={`mono ${styles.status}`}>
            <span className={styles.dot} aria-hidden="true" />
            {site.status}
          </Reveal>

          <div className={styles.actions}>
            <Magnetic>
              <TransitionLink href="/#work" className={styles.primary}>
                View projects <span aria-hidden="true">↓</span>
              </TransitionLink>
            </Magnetic>
            <TransitionLink href="/#contact" className={`link ${styles.ghost}`}>
              Get in touch
            </TransitionLink>
          </div>

          <ul className={`mono ${styles.socials}`}>
            {socials.map((s) => (
              <li key={s.label}>
                <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
            <li className={styles.coords}>
              <span aria-hidden="true">{coords}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
