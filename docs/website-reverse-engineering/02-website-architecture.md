# 02 — Website architecture of the reference

Evidence references (E1…E7) point to the ledger in `01-technical-stack.md`. Module names and behaviour come from the public source maps (E6) and were cross-checked against the DOM (E1, E2, E5).

## 1. Sitemap and page types

| URL | Barba namespace | Page | Notes |
|---|---|---|---|
| `/` | `home` | Home (single long page) | Intro, About, Skills, Awards, Selected work, Footer |
| `/work/` | `works` | Work index | Giant title list with hover-reveal thumbnail clusters; visually hidden `<h1>Works</h1>` |
| `/work/<slug>` (×6) | `work-details` | Case study | `data-project="N"` selects the gallery image set |
| `/design-lab/` | `design-lab` | "Digital Playground" | Experiments page (WebGL canvas + figure gallery); a Codrops-derived demo (Inferred from a Codrops banner filter in the source) |
| any unknown URL | `404` | Error page | Rotating one-liner copy, title, "page not found", button home; HTTP 404; reuses the home `<title>` |

Nine URLs are listed in `sitemap.xml`. There is no search, no blog, no contact page (contact is a `mailto:` button plus footer socials).

## 2. Component hierarchy (reconstructed from the DOM)

```
<html class="lenis lenis-smooth">
└─ <body data-barba="wrapper" aria-live="polite">
   ├─ <header.header>                      fixed · mix-blend-mode: difference · hides on scroll-down
   │   ├─ p.header__baseline               "— NAME" (thin serif, typewriter reveal) · ≥1024px only
   │   ├─ a.header__logo [data-tilt]       centred mark
   │   └─ nav.header__nav > ul             Work[badge] · Design Lab · Email me (a.button.magnet)
   ├─ <div data-barba="container" data-barba-namespace="…">     ← swapped on navigation
   │   ├─ <main>
   │   │   ├─ section.intro                mono labels · justified blurb · H1 (serif line + sans line) · socials
   │   │   ├─ hr                           1 px rule with triangular end-caps
   │   │   ├─ section.about                h2 · portrait [data-image + <canvas>] · text
   │   │   ├─ section.skills               h2 · one serif display line, dash-separated
   │   │   ├─ section.awards               h2 · 3-column ledger (organisation — award — count)
   │   │   ├─ hr
   │   │   └─ section.selected             title · 6 cards (image+canvas, meta row, title+arrow, rule)
   │   └─ <footer.footer>                  bordered card · big CTA · local time · socials · credits
   ├─ <div.loading>                        fixed full-screen · two counters flanking a logo
   └─ <div.transition>                     fixed full-screen white panel used by the route curtain
```

Home page placement at ≥1024 px is a 12-column grid (20 px gap, container ≤ 1560 px): headings in column 2, media in columns 5–8, copy in columns 9–12. "Selected work" is a hand-placed editorial grid: six cards occupy explicit `grid-area`s (cols 1–7, 9–12, 1–5, 7–12, 1–7, 9–12) over six viewport-height-based rows, so the cards stagger instead of tiling.

## 3. Page-by-page structure

**Home.** Intro (100 vh): mono micro-labels, a justified uppercase blurb with a 50 px first-line indent, the two-line H1 (thin serif name over a bold sans title with triangle ornaments), four social links. About: portrait with a tonal overlay (`#4a4a4a` at 50 %, hard-light) and the WebGL distortion. Skills: a single serif display sentence whose segments are separated by drawn dashes. Awards: three aligned columns, no row rules. Selected work: six cards, each *meta row (mono "Project /0N" + categories) → title + serif arrow → 1 px bottom rule*, wrapped by a transparent full-card link.

**Work index.** Page = `h1` (hidden) + `.thumbgrid__wrap` + `ul.list`. Each of the 6 rows is a 12-column grid (index · giant serif title · categories · arrow) with a 1 px rule that has end-caps. Behind the list, each project owns a `.thumbgrid`: four thumbnails absolutely placed on a 100 × 100 % overlay grid via CSS variables (`--grid-row`, `--grid-column`), 4:3 and 18 vw wide, 10 px radius. Hovering a row fades the other rows to 50 % and reveals only that project's four thumbnails.

**Case study.** `main.work-details` is a 4-column grid: title (serif, uppercase, triangle) and description (justified, indented) → gallery (45 vh, WebGL carousel) → rule → two mono labels (project index, categories) → footer navigation: **Prev**, a numeric index `/01 … /06` (current one white), **Next**, and a back link "All Work".

**Design Lab.** Title, one paragraph of copy, a WebGL canvas (OGL) and a figure gallery. Body scroll is locked (`overflow: hidden`) while on this route.

**404.** Serif title, mono subtitle (rotating phrase), serif body line, outlined "home" button; initial hidden state and reveal use the same flicker/typewriter helpers as every other page.

## 4. JavaScript architecture (13 TypeScript modules)

| Module | Responsibility |
|---|---|
| `main.ts` | Imports `global`; drives the footer clock (12-hour display, updates `#local-time` children every 5 s) |
| `global.ts` | Lenis + `requestAnimationFrame` loop; loader counter; Barba init, one `leave` transition and five namespace views; `hideElements()` (sets the initial hidden state with GSAP); `scroll()` bootstrap (image hover, magnetic buttons, header hide/show, header and footer animations) |
| `helpers/animations.ts` | The animation vocabulary: `initFlickerAnimation`, `initTypewritingAnimation`, per-page inits (`initMain`, `initWorks`, `initWorkDetails`, `initDesignLab`, `initErrorPage`), header/footer timelines |
| `components/imageHover.ts` | Three.js displacement-grid effect (one instance per `[data-image]`) |
| `components/buttonTilt.ts` | Magnetic button controller (`[data-tilt]`) |
| `components/menuItem.ts`, `thumbGrid.ts` | Thin wrappers that prepare the Work-index hover (`will-change`) |
| `helpers/utils.ts` | `lerp`, `distance`, mouse position, viewport size |
| `work-details/{index,Media,images}.ts` | OGL carousel controller, one media plane per image, per-project image manifest |
| `design-lab/{index,Media}.ts` | Lab canvas controller and media plane |

**Declarative hooks.** Behaviour is attached through HTML attributes rather than per-component code: `data-splitting`, `data-text-animation`, `data-title-animation`, `data-section-animation`, `data-section-text-animation`, `data-delay-animation`, `data-parallax-animation`, `data-triangle`, `data-image`, `data-tilt`. This keeps the markup the single source of truth for which elements animate.

## 5. Lifecycle

1. The HTML arrives fully authored (static). The `main` module loads and executes `global`.
2. `initLoading()`: logo flicker, `Splitting()` over the document, `hideElements()` sets `opacity: 0` on a long list of selectors, a 10 ms interval counts 0 → 100 into two digit spans.
3. At 100 the loader slides up and `barba.init()` runs. Barba immediately executes the **current** namespace's `afterEnter`: scroll to top, kill ScrollTriggers, re-split text, re-hide targets, run the **1.6 s curtain**, then `scroll(initPageX)` and `ScrollTrigger.refresh(true)`.
4. On navigation: Barba fetches the target HTML (XHR) → `leave` (dispose lab/gallery instances, kill all ScrollTriggers, dispose each WebGL image renderer, fade the old container out over GSAP's default 0.5 s, remove its footer) → new container inserted → the next namespace's `afterEnter` (step 3).
5. `isMobile()` is a user-agent regex used to skip magnetic buttons, the Work-index hover and some WebGL regeneration.

Observed in headless Chromium (E2, E7): the XHR for the target page succeeds but the container is never swapped and the URL never changes, with no console or page error, from every starting page. Cause unknown (environment-specific or a reference defect); the lifecycle above is therefore *Observed in source*, not in runtime frames.

## 6. Navigation architecture

Header: logo → `/`; **Work** (with a count badge) → `/work/`; **Design Lab**; **Email me** (`mailto:`, new tab, magnetic). A click handler blocks navigation to the current URL. Case-study pages add prev / next / numbered index / back link. Footers repeat the social links. There is no mobile menu toggle: below 1024 px the same links stack, right-aligned, under a centred logo.

## 7. Reusable building blocks

| Block | Anatomy | Variants |
|---|---|---|
| Split text | Splitting.js → `.word` / `.char` spans → animated by attribute | flicker (words), typewriter (chars) |
| Micro-label | `.mono.text-sm.uppercase`, grey `#919191` | "Project /01", "FREELANCE", "LOCAL TIME ►" |
| Rule | `hr` 1 px `#4a4a4a` + two 9 px triangle end-caps via `::before/::after` | list row rule, section divider |
| Card | media + meta row + title/arrow + rule + full-card link | home grid card, list row |
| Button | outlined, 5 px radius, hover → white fill; `.magnet` adds pull | header CTA, 404 link |
| Footer | bordered 10 px-radius card (main) or slim bar (secondary) | home vs inner pages |
| Overlays | `.loading` (dark) and `.transition` (white) fixed panels | boot, route change |

## 8. Content and asset organisation

Static HTML per route; assets by convention: `/projects/NN/thumbnail.webp` (card image) and `/projects/NN/1…4.webp` (Work-index hover thumbnails), a portrait WebP, `/fonts/<Family>/<file>.{otf,ttf,woff,woff2}`, `/favicons/*`, `/meta.jpg`. Case-study gallery images are looked up by project id in `images.ts`. Content, markup and animation hooks are co-located in the HTML; there is no data layer.

## 9. Accessibility structure (Observed)

Hidden `<h1>` on the Work index, `aria-label` on the logo link, `aria-live="polite"` on `body` (added by Barba), only two `aria-hidden` attributes in the home DOM. Split character spans are not hidden from assistive tech, so text is exposed character by character (Inferred risk). No skip link, no visible focus style, no reduced-motion path.
