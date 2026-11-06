import { skillGroups } from "@/content/skills";
import { Reveal } from "@/components/fx/Reveal";
import styles from "./Capabilities.module.css";

/** Ledger layout: group · items · count, with hairlines between rows. */
export function Capabilities() {
  return (
    <section id="capabilities" className="section" aria-labelledby="cap-title">
      <div className="container">
        <hr className="rule" />
        <div className={`grid12 ${styles.grid}`}>
          <p className={`mono eyebrow ${styles.eyebrow}`}>
            <b>03</b> / Capabilities
          </p>
          <div className={styles.body}>
            <h2 id="cap-title" className="h2">
              <Reveal as="span" mode="scramble">
                Stack
              </Reveal>{" "}
              <em>&amp; tools.</em>
            </h2>
            <dl className={styles.ledger}>
              {skillGroups.map((g) => (
                <Reveal key={g.name} as="div" mode="fade" className={styles.row}>
                  <dt>
                    {g.name}
                    <span className={`mono faint ${styles.count}`} aria-hidden="true">
                      {String(g.items.length).padStart(2, "0")}
                    </span>
                  </dt>
                  <dd>
                    <ul>
                      {g.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
