"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/site";
import { projects } from "@/content/projects";
import { Magnetic } from "@/components/fx/Magnetic";
import { TransitionLink } from "./TransitionLink";
import { ThemeToggle } from "./ThemeToggle";
import { Mark } from "./Mark";
import { getLenis } from "@/lib/scroll";
import styles from "./Header.module.css";

/**
* Fixed header. Ink text on the page background, plus a frosted surface once the
 * page has scrolled so it stays legible over any figure in both themes (computed
 * colours, unlike blend modes, can be contrast-checked). Hides while scrolling down (after half a viewport),
 * returns on any upward scroll, and stays visible while it holds keyboard focus
 * or the mobile menu is open.
 */
export function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Keyed by pathname: navigating changes the key, which closes the menu with no effect needed.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    setOpenFor(next ? pathname : null);
  };
  const last = useRef(0);
  const focused = useRef(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const goingDown = y > last.current;
      const next = !focused.current && y > window.innerHeight / 2 && goingDown;
      setHidden((prev) => (prev === next ? prev : next));
      const past = y > 24;
      setScrolled((prev) => (prev === past ? prev : past));
      last.current = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Lock scrolling while the menu is open; Escape closes it.
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      sheet.current?.querySelector<HTMLElement>("a")?.focus();
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpenFor(null);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const count = String(projects.length).padStart(2, "0");

  return (
    <>
      <header
        className={styles.header}
        data-hidden={hidden && !open}
        data-scrolled={scrolled}
        onFocusCapture={() => {
          focused.current = true;
          setHidden(false);
        }}
        onBlurCapture={() => {
          focused.current = false;
        }}
      >
        <div className={styles.bar}>
          <TransitionLink href="/" className={styles.brand} aria-label={`${site.name}, home`}>
            <span className={styles.brandRule} aria-hidden="true" />
            <span className={styles.name}>{site.name}</span>
          </TransitionLink>

          <Mark className={styles.mark} size={30} />

          <nav aria-label="Primary" className={styles.nav}>
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <TransitionLink href={item.href} className={styles.navLink}>
                    {item.label}
                    {"badge" in item && item.badge ? (
                      <sup className={`mono ${styles.badge}`} aria-label={`${count} projects`}>
                        {count}
                      </sup>
                    ) : null}
                  </TransitionLink>
                </li>
              ))}
              <li>
                <Magnetic>
                  <a className={styles.cta} href={`mailto:${site.contact.email}`}>
                    Email me
                  </a>
                </Magnetic>
              </li>
            </ul>
          </nav>

          <div className={styles.tools}>
            <ThemeToggle />
            <button
              ref={menuBtn}
              type="button"
              className={`mono ${styles.menuBtn}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={sheet}
        id="mobile-menu"
        className={styles.sheet}
        data-open={open}
        // `inert` keeps the closed sheet out of the tab order and the accessibility tree.
        {...(open ? {} : { inert: true })}
      >
        <nav aria-label="Mobile">
          <ul>
            {[{ label: "Home", href: "/" }, ...nav].map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className={styles.sheetLink}>
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <a className={`${styles.sheetMail} mono`} href={`mailto:${site.contact.email}`}>
          {site.contact.email}
        </a>
      </div>
    </>
  );
}
