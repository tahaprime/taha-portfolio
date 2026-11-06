import { competitions, education, experience } from "@/content/experience";
import { Reveal } from "@/components/fx/Reveal";
import styles from "./Journey.module.css";

type Row = { period: string; title: string; org: string; detail?: readonly string[] | string; tags?: readonly string[] };

function Block({ label, rows }: { label: string; rows: readonly Row[] }) {
  return (
    <div className={styles.block}>
      <h3 className="mono muted">{label}</h3>
      <ul>
        {rows.map((r) => (
          <Reveal as="li" mode="fade" className={styles.row} key={`${r.title}-${r.period}`}>
            <p className={`mono ${styles.period}`}>{r.period}</p>
            <div>
              <p className={styles.title}>{r.title}</p>
              <p className="muted">{r.org}</p>
            </div>
            <div className={styles.detail}>
              {typeof r.detail === "string" ? <p>{r.detail}</p> : null}
              {Array.isArray(r.detail) ? (
                <ul>
                  {r.detail.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ) : null}
              {r.tags?.length ? <p className="mono faint">{r.tags.join(" · ")}</p> : null}
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export function Journey() {
  const exp: Row[] = experience.map((e) => ({
    period: e.period,
    title: e.role,
    org: `${e.org} · ${e.unit}`,
    detail: e.points,
    tags: e.stack,
  }));
  const edu: Row[] = education.map((e) => ({ period: e.period, title: e.title, org: e.org, detail: e.status }));
  const comp: Row[] = competitions.map((c) => ({ period: c.period, title: c.title, org: c.org, detail: c.detail }));

  return (
    <section id="journey" className="section" aria-labelledby="journey-title">
      <div className="container">
        <hr className="rule" />
        <div className={`grid12 ${styles.grid}`}>
          <p className={`mono eyebrow ${styles.eyebrow}`}>
            <b>04</b> / Journey
          </p>
          <div className={styles.body}>
            <h2 id="journey-title" className="h2">
              <Reveal as="span" mode="scramble">
                Experience
              </Reveal>{" "}
              <em>&amp; education.</em>
            </h2>
            <Block label="Experience" rows={exp} />
            <Block label="Education" rows={edu} />
            <Block label="Hackathons & competitions" rows={comp} />
          </div>
        </div>
      </div>
    </section>
  );
}
