# Reverse-engineering of scalzodesign.be → Taha Hoummadi's portfolio

Concise summary of the analysis and what was built from it. Written for the portfolio owner; every claim in the numbered documents is labelled *observed*, *inferred* or *unknown* and tied to an evidence ID or a measurement.

## What the reference is

A static multi-page portfolio (Vite + TypeScript + SCSS) with Barba.js page transitions, GSAP 3.12.3 for all animation, Lenis 1.0.29 for smooth scrolling, Splitting.js for text, and WebGL (Three.js r136, OGL) for image effects. Fonts are commercial (PP Neue Montreal, PP Eiko), hosting is static files behind a CDN, and analytics is GA4. Its source maps are public, which made the architecture directly observable.

Its "premium" feel comes from **type contrast** (86 px serif/sans display against 10 px mono labels), a restrained palette, hand-placed asymmetric grids, and an animation language that behaves like a terminal powering on: flickering words, scrambling headings, a sweeping curtain between pages, and photographs that break into displaced tiles under the cursor.

It also has weaknesses that were fixed rather than copied: it ignores `prefers-reduced-motion`, runs seven WebGL contexts at 420 draw calls per second even when idle, lays a canvas over each project link so the image is not clickable, mislabels noon as AM, ships text at 3.4:1 contrast, and can hang a navigation with no fallback.

## What was built

A Next.js 16 static-export portfolio with its own identity ("Spec Sheet": paper, ink, one accent, registration marks, generated specimen plates), light and dark themes, a once-per-session boot loader, a route curtain, flicker/scramble text reveals, an accessible WebGL hover effect and a data-driven set of case studies. All facts come from the owner's previous portfolio and GitHub; nothing is invented.

| Measure | Result |
|---|---|
| Lighthouse (mobile, throttled) | Performance **99** (home), 100 (work index), 95 (case study); Accessibility / Best Practices / SEO **100** |
| axe-core WCAG 2.2 AA | **0 violations**, 4 page types × 2 themes |
| Reduced motion, no-JS | Fully supported and runtime-verified |
| WebGL idle cost | **0** draw calls/s (reference: 420) |
| Fonts / JS (home) | 112 KB / 238 KB gz (React + Next runtime ≈ 160 KB of that) |

## Documents

| File | Contents |
|---|---|
| [01-technical-stack.md](01-technical-stack.md) | Technology table with evidence, confidence and role; evidence ledger; weaknesses |
| [02-website-architecture.md](02-website-architecture.md) | Sitemap, component hierarchy, module architecture, lifecycle |
| [03-design-system.md](03-design-system.md) | Typography, colour (with computed contrast), layout, tokens, screenshot gallery |
| [04-animations-interactions.md](04-animations-interactions.md) | Each interaction: what / when / how / technology / how to reproduce, with measurements |
| [05-responsive-analysis.md](05-responsive-analysis.md) | Breakpoints, per-viewport layout, defects |
| [06-implementation-plan.md](06-implementation-plan.md) | Architecture as built, deviations from the plan, parity matrix, QA results, maintenance |

## Method and limits

REA (`capture_browser_scenario`, `export_web_scripts`, `analyze_javascript_application`) produced the formal evidence; the public source maps supplied module-level detail; Playwright covered hover, wheel and timing, which REA cannot drive. REA's static analysis of the minified bundle is only partial (40,025 unknowns), so library identification rests on banners, DOM markers and the source maps. The reference's page transition stalled in headless Chromium, so its curtain timing comes from source and CSS.

## Legal and publishing notes

- Nothing from the reference is reused: no code, copy, fonts, images, logo or ornament. Observed numeric parameters were treated as behavioural specs; this build uses its own values and its own implementation.
- `assets/ref/` holds screenshots of a third-party site for private analysis. They are listed in `.gitignore` and are **not meant to be published**; remove that line only if you are comfortable doing so.
- GSAP is used under its Standard "no charge" licence (free for a personal portfolio).
