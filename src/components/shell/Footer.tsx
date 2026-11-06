import { site, socials } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";
import { Magnetic } from "@/components/fx/Magnetic";
import { Clock } from "./Clock";
import { CopyEmail } from "./CopyEmail";
import { Arrow } from "./Arrow";
import styles from "./Footer.module.css";

/** Contact footer (also the Contact section; `id="contact"` is the anchor target). */
export function Footer({ cvHref }: { cvHref: string | null }) {
  const year = new Date().getFullYear();
  const links = [
    ...socials.map((s) => ({ label: s.label, href: s.href, external: true })),
    ...(cvHref ? [{ label: "CV (PDF)", href: cvHref, external: false, download: true }] : []),
  ];

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.lead}>
            <p className="mono eyebrow">
              <b>05</b> / Contact
            </p>
            <Reveal as="h2" mode="scramble" className={styles.title}>
              Let’s build systems that last.
            </Reveal>
            <p className="mono muted">
              {site.location.country} — {site.status}
            </p>
          </div>

          <div className={styles.cta}>
            <Magnetic>
              <a className={styles.mail} href={`mailto:${site.contact.email}`}>
                <Arrow className={styles.mailArrow} /> {site.contact.email}
              </a>
            </Magnetic>
            <div className={styles.row}>
              <CopyEmail email={site.contact.email} className={styles.copy} />
              <p className="mono">
                <span className="muted">Local time ▸ </span>
                <Clock />
              </p>
            </div>
          </div>
        </div>

        <div className={styles.credits}>
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.label}>
                <a
                  className="link"
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })}
                >
                  {l.label}
                  {l.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="mono faint">
            © {year} {site.name} · Built with Next.js, GSAP &amp; Lenis
          </p>
        </div>
      </div>
    </footer>
  );
}
