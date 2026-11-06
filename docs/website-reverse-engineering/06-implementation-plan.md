# 06 — Implementation plan, architecture and QA (as built)

Status: **implemented and verified** (2026-11-06). This document records what was built from the reverse-engineering, every place it deliberately differs from the approved plan, and the measured results.

## 1. Outcome

A static-export **Next.js 16** portfolio for Taha Hoummadi: Home (Hero · About · Selected work · Capabilities · Journey · Contact), `/projects` index, six `/projects/<slug>` case studies, a 404, both a light and a dark theme, and a loader / route curtain / text-reveal / WebGL-hover animation system inspired by the reference but with its own identity.

```
npm install
npm run dev          # development
npm run build        # static export to out/   (needs network once, for the font files)
npm run preview      # serves out/ at http://localhost:4173 (brotli, immutable caching)
npm run lint && npm run typecheck
npm run figures      # regenerate the six project plates + favicon
```

## 2. Architecture

| Layer | Decision | Notes |
|---|---|---|
| Framework | Next.js 16.4 App Router, TypeScript, `output: "export"`, `trailingSlash: true` | `cacheComponents` / `partialPrefetching` from the scaffold were removed: they conflict with `generateStaticParams` + `dynamicParams = false` |
| Styling | Global tokens + CSS Modules (no Tailwind) | Tokens in `src/styles/tokens.css` (both themes); layout by `grid-area` per breakpoint, like the reference |
| Motion | GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText) + `@gsap/react`; Lenis 1.3 on `gsap.ticker` | SplitText and ScrambleText are in the public package under GSAP's "no charge" licence |
| WebGL | `src/lib/distortion.ts`: ≈ 350 lines, raw WebGL2, one shared context, lazy chunk | No Three.js / OGL |
| Page transitions | `MotionProvider` + `TransitionLink` (curtain around `router.push`) | Hard 4.5 s timeout falls back to `location.assign` |
| Fonts | Bricolage Grotesque (width axis), Instrument Serif italic, JetBrains Mono 400, via `next/font` (self-hosted at build) | 3 files, 112 KB total (was 8 files / ~300 KB before trimming subsets and axes) |
| Content | Typed files in `src/content/` | The only place copy, links and project facts live |
| Figures | `scripts/build-figures.mjs`: seeded generative SVG plates (no text), plus favicon / touch icon | Conceptual illustrations, never screenshots |
| Runtime deps | `next react react-dom gsap @gsap/react lenis` (6) | Dev: TypeScript, ESLint, `sharp` (icon/portrait processing) |

### Deviations from the approved plan (and why)

| Plan | As built | Reason |
|---|---|---|
| Figures as `sharp`-rendered responsive WebP | SVG files used directly | Smaller (12–30 KB), crisp at any size, and a text-free SVG rasterises identically into the WebGL texture. `sharp` is only used for the apple-icon and the portrait |
| Header `mix-blend-mode: difference` (reference trick) | Ink text + frosted surface after scrolling | axe and other tools cannot evaluate blend modes (flagged 1.2:1 although it renders legibly); computed colours are verifiable in both themes |
| RoughEase flicker | Binary stepped flicker (`steps(1)` keyframes) | Partial-opacity frames fail contrast audits mid-animation; discrete on/off is also closer to a real neon tube |
| `lenis/react` wrapper | Core `Lenis` class created and ticked in one effect | First attempt shipped a real bug (wheel scrolling dead) because the instance was not ready when the ticker was attached |
| Root 15 px | 16 px root, 15 px body | Respect user font settings; sizes are rem-based and fluid |
| First-load JS ≲ 170 KB gz | **238 KB gz** on `/` | Plan under-estimated the framework floor: React DOM + the App Router runtime are ≈ 160 KB gz; GSAP + plugins ≈ 55 KB; app code ≈ 20 KB. Performance still scores 98–100 because the LCP text is painted before JS (below) |
| OG image from a design file | Screenshot of the real hero at 1200×630 (reduced motion) | Uses the real fonts and layout; reproducible with any headless browser |
| `typedRoutes` | Off | Its generated types rejected trailing-slash and data-driven hrefs; links are verified by a runtime crawl instead (see QA) |
| Add "Cache Components" scaffold defaults | Removed | See framework row |

Added beyond the plan: a modern `browserslist` baseline in `package.json` (Chrome/Edge/Firefox ≥ 120, Safari/iOS ≥ 17.4, so no legacy polyfills are shipped), `scripts/serve.mjs` (dependency-free preview server with brotli/gzip and immutable caching, so Lighthouse measures realistic transfer sizes), a `useMediaQuery` hook built on `useSyncExternalStore`, and a hard failsafe in the head script (drops the animation gate if the app has not hydrated after 9 s).

## 3. Progressive enhancement and accessibility model

- The HTML is complete without JavaScript. A blocking head script (≈ 1 KB) resolves the theme (stored choice > system preference > light) and adds `js-motion` **only** when motion is allowed; CSS hides reveal targets only under `html.js-motion`. No JS, crawlers and reduced-motion users see everything immediately.
- `prefers-reduced-motion`: no loader, no curtain, no Lenis, no reveals, no WebGL, no magnetic pull. Verified at runtime: 0 of 28 reveal elements hidden, navigation in 77 ms.
- Animated text keeps the real string in a `sr-only` node and animates an `aria-hidden` copy. Focus moves to `<main>` after a curtain navigation; skip link is the first tab stop; every interactive element shows a ≥ 2 px focus ring.
- LCP-critical text (hero name, labels and blurb, page titles) is `hold={false}`: painted at first paint, animated in place.
- Theme toggle is a real button (`aria-pressed`); the CV button renders only if `public/cv/*.pdf` exists at build time, so there is no dead link.

## 4. Reference → implementation parity matrix

| # | Reference behaviour (measured / observed) | This build | Status |
|---|---|---|---|
| 1 | Lenis 1.0.29, default options | Lenis 1.3.27 on `gsap.ticker`; off under reduced motion | Same, improved |
| 2 | Fake 10 ms counter, ≈ 2.5 s hand-over; always runs | Real-readiness loader (fonts + load), ≥ 0.9 s, once per session. Measured 3.2 s end-to-end on the first visit, none on the second | Improved |
| 3 | 1.6 s white curtain; PJAX stalled in headless Chromium | Cover 0.55 s → swap → reveal 0.75 s; URL committed in ≈ 810 ms; focus on `<main>`; back button works; 4.5 s fallback | Different, improved |
| 4 | Header hides past ½ viewport, returns on upward scroll | Identical thresholds (visible at 259 px, hidden at 519 px, back after a 200 px upward scroll) + frosted surface, stays visible while focused | Same, improved |
| 5 | Word flicker via RoughEase (partial opacity) | Binary stepped flicker | Different |
| 6 | a–z scramble | ScrambleText with code glyphs `01{}[]<>/#_+=` + screen-reader text | Different, improved |
| 7 | ScrollTrigger reveals, `top bottom` | ScrollTrigger once, `top 96%` | Same |
| 8 | Triangle ornaments via a CSS variable | `+` registration marks, rules with `+` end caps, `FIG.` captions | Different (own motif) |
| 9 | Magnetic pull 0.3, lerp 0.1; equilibrium ≈ 0.23×; pull persisted outside the radius | `quickTo`, 0.35 factor; **19.9 px at 0.5 button-widths, 0 px outside the radius** | Improved |
| 10 | Three.js r136, 7 contexts, **420 draw calls/s idle**, canvas blocks the card link | One WebGL2 context; **0 draws/s idle and after settling**; canvas `pointer-events: none`; hit target at the card centre is the link; canvas removed after leave | Improved |
| 11 | Work index: 4 thumbs scatter, siblings dim | 3-piece cluster (plate, detail crop, spec card), siblings dim to 0.4, keyboard focus triggers it | Same, improved |
| 12 | OGL drag carousel | CSS scroll-snap strip + Prev/Next buttons (figure + conceptual diagram) | Different (accessible) |
| 13 | Footer clock = visitor's time, AM/PM bug | Morocco time via `Intl` (`Africa/Casablanca`), correct offset label (GMT+1) | Improved |
| 14 | Reduced motion ignored (runtime-proven) | Fully respected (runtime-proven) | Improved |
| 15 | 404 page, Design Lab | 404 implemented; Design Lab not replicated (no content) | Partial |
| 16 | Commercial fonts, GA4 | OFL fonts, no analytics | Improved |

## 5. QA results

**Static:** `npm run lint` and `npm run typecheck` clean; `npm run build` produces 17 static routes (home, projects, 6 case studies, 404, icon/apple-icon/manifest/robots/sitemap and the two social-image routes). `npm audit --omit=dev`: 0 vulnerabilities (the 8 moderate findings are in dev tooling only).

**Browser (REA + Playwright, evidence in `assets/evidence/`):** 13 test groups pass: loader gate and second-visit skip, theme toggle and persistence and system preference, header thresholds, curtain + focus + history, WebGL, magnetic, index hover + keyboard focus, case study (gallery, diagram, metrics), reduced motion, mobile (390 px: no horizontal overflow, menu open/close, `inert` when closed), keyboard (skip link first, 9 stops all with visible focus), link audit (8 internal URLs 200, anchors present, all external links `target=_blank rel=noopener`). Console: 0 errors or warnings (two benign Chrome notices were filtered: the software-GL "GPU stall" message and an unused-CSS-preload hint) apart from the intentional 404 test.

**Responsive:** no horizontal overflow at 320, 390, 768, 1024, 1440 and 1920 px on home, `/projects/`, two case studies and the 404; 768 px renders the two-column card grid, 1024 px and up the staggered 12-column grid.

**axe-core 4.14 (wcag2a/aa, 2.1, 2.2 AA, best-practice): 0 violations** on `/`, `/projects/`, a case study and the 404, in light and dark.

**Lighthouse 13.6 (simulated slow 4G, 4× CPU), served with brotli:**

| Page | Perf | A11y | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home, mobile | **99** | 100 | 100 | 100 | 0.9 s | 0.9 s | 10 ms | 0.041 |
| Home, desktop | **98** | 100 | 100 | 100 | 0.2 s | 0.2 s | 0 ms | 0.005 |
| Work index, mobile | **100** | 100 | 100 | 100 | 0.9 s | 0.9 s | 10 ms | 0.007 |
| Case study, mobile | **95** | 100 | 100 | 100 | 0.9 s | 2.9 s | 10 ms | 0 |

Payload (home): JS 238 KB gz in 10 files, CSS 8 KB gz, fonts 112 KB, portrait 31 KB; each plate 12–30 KB.

## 6. Known limitations and next steps

1. **Case-study LCP 2.9 s (mobile, throttled).** Stable across runs; synchronous image decode did not change it. Hypothesis: rasterising the pattern-heavy SVG figure on a 4× slowed CPU. Fix path: pre-render the cover plates to WebP in `build-figures.mjs` (`sharp` is already a dev dependency).
2. **CV:** place your PDF in `public/cv/` and rebuild; the button appears automatically. Until then the footer shows only GitHub and LinkedIn.
3. **To confirm with the owner:** the headline figures carried over from the previous portfolio (3+ years, 5+ AI projects, 10+ full-stack projects), the AI Health Assistant metrics (87% / 4.2/5), Pyramid's wording (GitHub says "online banking system", the brief says "personal finance"), location text ("Morocco"), and the default URL `https://tahableu.me` (`NEXT_PUBLIC_SITE_URL`). The phone number is deliberately not published.
4. **SkillsMatch and CodePoster** have no source facts beyond the brief; add them to `src/content/projects.ts` (and a plate in `build-figures.mjs`) when details exist.
5. **Reference limits:** REA has no hover/scroll/touch primitives (Playwright filled that gap); the reference's Barba transition stalled in headless Chromium, so its curtain timing comes from source/CSS.
6. **Bundle floor:** ≈ 160 KB gz of the 238 KB is React + the Next runtime. Cutting further means a different framework (e.g. Astro), not tuning.
7. The AI-generated concept images on the previous portfolio were not reused (they are renders with garbled text, not screenshots). Real screenshots can be added as extra gallery slides in `projects/[slug]/page.tsx`.

## 7. Maintenance cheat-sheet

| Task | Where |
|---|---|
| Edit copy, links, status, stats | `src/content/site.ts` |
| Add / edit a project (card, case study, index) | `src/content/projects.ts` (+ a plate in `scripts/build-figures.mjs`, then `npm run figures`) |
| Skills, experience, education, competitions | `src/content/skills.ts`, `src/content/experience.ts` |
| Colours, type scale, spacing | `src/styles/tokens.css` |
| Motion constants (durations, glyphs) | `src/lib/motion.ts`; WebGL feel: top of `src/lib/distortion.ts` |
| Change the domain | `NEXT_PUBLIC_SITE_URL` at build time |
| Deploy | Any static host: build command `npm run build`, output directory `out` (e.g. Cloudflare Pages) |
| OG image | Re-capture the hero at 1200×630 with reduced motion → `src/app/opengraph-image.png` (+ `twitter-image.png`) |
