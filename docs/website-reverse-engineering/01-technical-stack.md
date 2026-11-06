# 01 — Technical stack of the reference (scalzodesign.be)

Reference analysed: `https://www.scalzodesign.be/` (a freelance designer's portfolio). Analysis date: 2026-11-06.
Labels used throughout: **Observed** (seen directly), **Inferred** (reasoned from observations), **Unknown** (not established).

## 1. Method and evidence ledger

| # | Technique | Tool | Evidence ID |
|---|---|---|---|
| E1 | Home load (1440×900, motion on): post-JS DOM, console, network + response headers | REA `capture_browser_scenario` | `ev_4c2e382b02e9125de93bdc0e47553cdee14f7999ed3c57e29158c107c3170fd6` |
| E2 | Route walk with response bodies retained (script/CSS/font bytes) | REA `capture_browser_scenario` | `ev_eb8fd981c7c34dd29ec902e27b03383b13a3105f06517c82574831d148309459` |
| E3 | Export of retained scripts, digest-verified (`main` sha256 `9bf4d94a…0644`, `global` sha256 `fca33b27…f182`) | REA `export_web_scripts` | `ev_cdc231c100b5e434351a3e744e1d6e56b990d67c7f698c1a1a12eec274f886cb` |
| E4 | Static analysis of the exported bundle (3 files, 394,744 AST nodes, 0 parse failures; semantic graph **partial**, 40,025 unknowns because the bundle is minified) | REA `analyze_javascript_application` | parent `ev_397f90fbab77919984ad484559e1f3e87ce04cf3ec1be9b02f8958123662356a`, summary `ev_d98e86e9e66ce1479c01a6d2a1b4237ad43ce26b535666ce59937f801e286d65` |
| E5 | Screenshot matrices 1440 / 1024 / 768 / 390 | REA `capture_browser_scenario` | `ev_96f2efc9…336a`, `ev_510b84bd…4c7b`, `ev_c9695787…7793`, `ev_5d106ca4…793c` |
| E6 | Public source maps (`*.js.map` served with `sourcesContent`) read over HTTP for module names and original TypeScript | HTTP GET + `jq` | n/a (not an REA operation) |
| E7 | Pointer / wheel / timing probes (REA has no hover or wheel action) | Playwright (`playwright-core` 1.65, same Chromium 151) | `assets/evidence/behaviour-probe-results.json` |

**Limits that matter.** The bundle is minified, so REA's graph is partial: library identification rests on banners, strings, DOM markers and the source map, not on a full call graph. REA never executed the bundle. The Barba route transition could not be driven to completion in headless Chromium (see `04`); route timings therefore come from source and CSS, not from runtime frames.

## 2. Confirmed technologies

| Technology | Evidence | Confidence | Role |
|---|---|---|---|
| **Vite (Rollup) build** | `/assets/<name>-<8-char hash>.js\|.css`; `<script type="module" crossorigin>` + `<link rel="modulepreload">` + `<link rel="stylesheet" crossorigin>`; 407-byte `main` entry importing the 783 KB `global` chunk. Signature of Vite's HTML output, not an explicit banner | High | Bundling, code splitting, hashed assets |
| **TypeScript** | Source map `sources`: `src/main.ts`, `src/global.ts`, `src/components/*.ts`, `src/helpers/*.ts`, `src/work-details/*.ts`, `src/design-lab/*.ts` | High | Application language (13 modules, ≈70 KB of source) |
| **SCSS** | Source map shows `import "../styles/style.scss"`; output is 43 KB flat CSS | High | Styling source (BEM-named blocks) |
| **Barba.js** (`@barba/core`) | `data-barba="wrapper"`, `data-barba="container"`, `data-barba-namespace` ∈ {home, works, work-details, design-lab, 404}; `body[aria-live=polite]`; map file `@barba/core/dist/barba.mjs`; runtime XHR for `/work` | High | PJAX navigation and view lifecycle |
| **GSAP 3.12.3** + ScrollTrigger 3.12.3, CSSPlugin 3.12.3, EasePack (RoughEase), Observer | Banners `GSAP 3.12.3`, `ScrollTrigger 3.12.3`, `CSSPlugin 3.12.3` (a second `3.11.0` banner is also present, likely EasePack/Observer, not individually attributed); map files `gsap/*` | High | Timelines, scroll triggers, flicker easing |
| **Lenis 1.0.29** (`@studio-freight/lenis`) | `lenisVersion="1.0.29"`; `<html class="lenis lenis-smooth">`; `scroll-behavior: auto` | High | Smooth scrolling, default options, driven by the app's own `requestAnimationFrame` loop |
| **Splitting.js** | Classes `words chars splitting`, attributes `data-splitting`, `data-char`, `data-word`; CSS custom properties `--char-*`, `--word-*`, `--line-*`; map file `splitting/dist/splitting.js` | High | Splits text into word/char spans for animation |
| **Three.js r136** | `<canvas data-engine="three.js r136">` (emitted by Three itself); map file `three/build/three.module.js` | High | Per-image WebGL grid-distortion shader (7 canvases on the home page) |
| **OGL** | 19 `ogl/src/*` modules in the map | High (present); *Inferred* (use) | Curved-plane draggable gallery (case study / lab); source for `work-details/index.ts` imports `Renderer, Camera, Plane, Transform` |
| **normalize-wheel**, **lodash/debounce** | Map files (`normalize-wheel/*`, `lodash/debounce.js` + 13 helper files) | High | Wheel normalisation and debounced snapping in the gallery |
| **PP Neue Montreal (Medium)**, **PP Neue Montreal Mono (Medium)**, **PP Eiko (Thin)** | `@font-face` + font requests (`/fonts/PP-*/…otf`, 121 KB / 187 KB / 171 KB); `.otf`, `.ttf`, `.woff`, `.woff2` all declared, browser fetched OTF first | High (identity) / Medium (foundry: "PP" family names match Pangram Pangram; commercial licence is *Inferred*) | Sans (UI/titles), mono (micro-labels), thin serif (display accents) |
| **Google Analytics 4** | Requests to `googletagmanager.com/gtag/js`, `analytics.google.com/g/collect`, `stats.g.doubleclick.net`, `google.co.ma/ads/ga-audiences`; inline `gtag("config", …)` | High | Analytics (measurement ID not reproduced here) |
| **Static multi-page site** | 9 URLs in `sitemap.xml`; per-route HTML with its own `<title>`; no API/JSON requests apart from Barba page fetches | High (for the routes captured) | No CMS or backend observed |
| **Apache-style static host behind a CDN** | `/work` → 301 with Apache's default "Moved Permanently" page (`iso-8859-1`); headers `x-cdn-cache`, `x-cdn-pop: rbx`, `x-cdn-request-id`; `accept-ranges`; `age`; no `server` header | Medium (vendor unproven) | Hosting and edge delivery |

## 3. Delivery profile

- **Compression:** brotli on HTML/JS/CSS. **Caching:** `Cache-Control: max-age=900` on hashed JS/CSS/images (15 min, short for hashed files); fonts carry no explicit cache header. Assets last modified Apr 2024.
- **Trailing slash:** `/work` and `/design-lab` 301 to the slash form; case studies resolve without a slash.
- **SEO surface:** `sitemap.xml` present; `robots.txt` missing (404); Open Graph + Twitter card (`/meta.jpg`); `theme-color #161616`; favicon set + `site.webmanifest`. The 404 page reuses the home `<title>` (not unique).
- **Measured on this machine** (headless Chromium 151, software WebGL, so absolute times are pessimistic): DOMContentLoaded 1,404 ms, load 1,792 ms, LCP 1,684 ms, 18 requests, ≈ 967 KB transferred.

## 4. Bounded negatives (Observed)

No React, Vue, Next, Nuxt, Astro, jQuery or Tailwind signature in the DOM, the 783 KB bundle or the 43 KB CSS. **No `IntersectionObserver`** (scroll reveals use ScrollTrigger). **No `prefers-reduced-motion`** handling in JS or CSS, and a runtime test with reduced motion emulated produced an identical loader and identical word reveals (36 of 114 words visible in both runs). No `box-shadow`, gradient or `backdrop-filter` in the CSS. These claims are bounded to the home bundle and stylesheet that were captured.

## 5. Weaknesses we deliberately avoid in the new build

| Observation | Why it matters |
|---|---|
| Reduced motion ignored; loader always runs | Accessibility (WCAG 2.3.3) |
| Mobile detection by user-agent regex | Misclassifies touch laptops / iPadOS; feature detection (`(hover:hover) and (pointer:fine)`) is correct |
| 7 WebGL contexts, each re-rendering every frame: **420 draw calls per second while idle and off-screen** | Battery and main-thread cost; Three.js full build is the bulk of the 783 KB bundle |
| `<canvas>` sits above each project card's full-card link (Playwright hit-test: "canvas intercepts pointer events") | The image area of a card is not a click target |
| Root text `#6b6b6c` on `#161616` ≈ 3.4:1; micro-labels 9.6–10 px | Below WCAG AA for body text |
| `.button:focus { outline: none }` and no `:focus-visible` styling | Keyboard users lose the focus indicator |
| No timeout or fallback if the PJAX transition hangs (observed hang in headless Chromium: XHR succeeds, container never swaps, no error) | Navigation can silently fail; real links with a hard fallback are safer |
| Commercial fonts, third-party analytics, `max-age=900` on hashed assets | Licensing, privacy, cache efficiency |

## 6. Unknowns

Backend/hosting vendor; whether the Barba stall is environment-specific; the exact per-project gallery content (loaded from `images.ts`, mapped by project id); behaviour on real touch hardware (REA cannot emulate touch/UA; the narrow-viewport runs therefore show the CSS layout only, with desktop pointer features still active).
