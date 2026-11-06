import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { coverOf, projectBySlug, projects } from "@/content/projects";
import { Reveal } from "@/components/fx/Reveal";
import { Plate } from "@/components/fx/Plate";
import { Diagram } from "@/components/project/Diagram";
import { PlateGallery } from "@/components/project/PlateGallery";
import { pad } from "@/components/project/ProjectCard";
import { TransitionLink } from "@/components/shell/TransitionLink";
import styles from "./project.module.css";

// Static export: only the listed slugs exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const cover = coverOf(p);
  return {
    title: p.title,
    description: `${p.subtitle}. ${p.summary}`,
    alternates: { canonical: `/projects/${p.slug}/` },
    openGraph: {
      title: `${p.title} — Taha Hoummadi`,
      description: p.summary,
      url: `/projects/${p.slug}/`,
      // SVG illustrations are not valid social images; real covers are. Otherwise the site image is used.
      ...(cover.generated ? {} : { images: [{ url: cover.src, alt: cover.alt }] }),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  const i = projects.findIndex((x) => x.slug === slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const cover = coverOf(p);

  const facts: [string, string][] = [
    ["Status", p.status],
    ...(p.year ? ([["Period", p.year]] as [string, string][]) : []),
    ...(p.role ? ([["Role", p.role]] as [string, string][]) : []),
    ...(p.context ? ([["Context", p.context]] as [string, string][]) : []),
    ["Focus", p.tags.join(" — ")],
  ];

  // Gallery: the cover, then your extra images, then the conceptual diagram.
  const slides = [
    {
      id: "cover",
      label: cover.caption ?? (cover.generated ? `Fig. ${pad(p.index)} — generated illustration` : "Screenshot"),
      node: <Plate src={cover.src} alt={cover.alt} ratio="3 / 2" priority fit={cover.fit ?? "cover"} />,
    },
    ...(p.gallery ?? []).map((g, n) => ({
      id: `g${n}`,
      label: g.caption ?? `Image ${n + 2}`,
      node: <Plate src={g.src} alt={g.alt} ratio="3 / 2" fit={g.fit ?? "contain"} />,
    })),
    ...(p.diagram
      ? [
          {
            id: "diagram",
            label: `Fig. ${pad(p.index)}b — ${p.diagram.caption}`,
            node: <Diagram diagram={p.diagram} title={p.title} />,
          },
        ]
      : []),
  ];

  return (
    <article aria-labelledby="project-title" className={styles.page}>
      <header className={`container ${styles.header}`}>
        <p className="mono eyebrow">
          <b>/{pad(p.index)}</b> Project
        </p>
        <h1 id="project-title" className={`display ${styles.title}`}>
          <Reveal as="span" mode="scramble" hold={false}>
            {p.title}
          </Reveal>
        </h1>
        <p className={`serif ${styles.subtitle}`}>{p.subtitle}</p>
      </header>

      <section className="container" aria-label="Figures">
        <PlateGallery slides={slides} />
      </section>

      <section className={`container grid12 ${styles.body}`}>
        <dl className={styles.facts}>
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="mono muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.story}>
          <Reveal as="p" mode="flicker" className={`lead ${styles.summary}`}>
            {p.summary}
          </Reveal>

          {p.metrics?.length ? (
            <ul className={styles.metrics}>
              {p.metrics.map((m) => (
                <li key={m.label}>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className="mono muted">{m.label}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {p.highlights?.length ? (
            <div className={styles.block}>
              <h2 className="mono muted">What I built</h2>
              <ul className={styles.highlights}>
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.block}>
            <h2 className="mono muted">Stack</h2>
            <ul className={styles.stack}>
              {p.stack.map((s) => (
                <li key={s} className="mono">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {p.links?.length ? (
            <div className={styles.block}>
              <h2 className="mono muted">Links</h2>
              <ul className={styles.links}>
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a className="link" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <nav className={`container ${styles.pager}`} aria-label="More projects">
        <TransitionLink href={`/projects/${prev.slug}/`} rel="prev" className={styles.pagerLink}>
          <span className="mono muted">← Previous</span>
          <span className={styles.pagerTitle}>{prev.title}</span>
        </TransitionLink>
        <TransitionLink href="/projects/" className={`mono link ${styles.all}`}>
          All projects
        </TransitionLink>
        <TransitionLink href={`/projects/${next.slug}/`} rel="next" className={`${styles.pagerLink} ${styles.nextLink}`}>
          <span className="mono muted">Next →</span>
          <span className={styles.pagerTitle}>{next.title}</span>
        </TransitionLink>
      </nav>
    </article>
  );
}
