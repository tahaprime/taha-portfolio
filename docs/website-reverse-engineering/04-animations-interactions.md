# 04 — Animations and interactions of the reference

Sources: application TypeScript read through the public source maps (**Observed in source**), runtime probes with Playwright on the live site (**Measured**, `assets/evidence/behaviour-probe-results.json`) and screenshots (E5). Numbers are specs to understand the feel; the new portfolio uses its own values.

## 0. The animation language in one view

The site behaves like a **terminal powering on**. Text is never faded as a block: words flicker into existence in random order, headings scramble through random letters before settling, pages are wiped by a bright band, and photographs react to the pointer by breaking into displaced tiles that heal. Almost everything is **opacity or character swaps** (cheap to composite); transforms are reserved for the curtain, magnetic buttons and the hover thumbnails. Easings come from one family (`power3`, `expo`, a custom rough ease); durations cluster at 0.3 / 0.5 / 1 / 1.6 s.

| # | Interaction | Trigger | Duration (observed) | Technology |
|---|---|---|---|---|
| 1 | Smooth scroll | Wheel | continuous | Lenis 1.0.29 (default options) |
| 2 | Loader | Page load | ≈ 2.5 s from navigation (headless) | `setInterval` + CSS transition + GSAP |
| 3 | Route curtain | Navigation / first view | 1.6 s | GSAP, Barba |
| 4 | Header hide/show | Scroll direction | 0.3 s | native `scroll` + CSS |
| 5 | Flicker reveal | Load / scroll into view | 1 s per word, 0.08–0.09 s stagger | GSAP RoughEase + Splitting |
| 6 | Scramble-typewriter | Load / scroll into view | 0.06 s per char, 0.08 s stagger | GSAP `innerHTML` tween |
| 7 | Section reveal | Scroll | opacity 0→1 | GSAP ScrollTrigger |
| 8 | Ornament reveal | After text reveal | 1 s | CSS custom property tween |
| 9 | Magnetic button | Pointer near button | lerp 0.1 / frame | `requestAnimationFrame` |
| 10 | Image distortion | Pointer over image | decays ≈ 0.3–0.4 s half-life | Three.js r136 shader |
| 11 | Work-index hover | Pointer over row | 0.5 s in / 0.3 s out | GSAP + CSS `:has()` |
| 12 | Case-study gallery | Wheel / drag | lerp 0.05 | OGL + normalize-wheel |
| 13 | Footer clock | Timer | 5 s tick | plain JS |

---

## 1. Smooth scrolling
- **What:** wheel scrolling glides with inertia instead of jumping. **When:** always (desktop wheel; touch stays native).
- **How:** `new Lenis()` with defaults, ticked by the site's own `requestAnimationFrame` loop; `<html>` receives `lenis lenis-smooth`; `scroll-behavior` stays `auto`. ScrollTrigger is not explicitly synced (it reads the native `scroll` events Lenis produces).
- **Tech:** Lenis. **Reproduce:** Lenis driven by `gsap.ticker` + `lenis.on('scroll', ScrollTrigger.update)`; not mounted under reduced motion.

## 2. Loader
- **What:** a dark panel with two counters (0 → 100 %) either side of a faceted logo that flickers in; the panel then lifts away. **When:** first load only; every route entry afterwards uses the curtain instead.
- **How:** counter interval 10 ms (≥ 1 s) updating two spans; at 100 the panel gets `translate: 0 -100%` and `opacity: 0` with CSS `transition: translate 3s ease .3s, opacity .3s ease .7s`; then `barba.init()`. The percentage is cosmetic: it is not tied to real loading. **Measured:** loader hand-over at ≈ 2.5 s after navigation (DOMContentLoaded 1.4 s).
- **Tech:** `setInterval`, GSAP (logo flicker), CSS transitions. **Reproduce:** tie the readout to real readiness (fonts + first media), keep it ≥ 0.8 s, show once per session, skip entirely for reduced motion / no-JS.

## 3. Route curtain (page transition)
- **What:** a white band sweeps up through the viewport while the page underneath is reset, then the new page's text powers on. **When:** every first view and every Barba navigation.
- **How (source):** `leave`: dispose WebGL/gallery instances, kill all ScrollTriggers, fade the old container out (GSAP default 0.5 s), remove its footer. `afterEnter`: scroll to top, kill triggers, re-split text, hide targets, then `.transition` goes from `translate(0,100%) scaleY(1)` to `translate(0,0) scaleY(0)` in **1.6 s `power3.inOut`** with `transform-origin: center top` (a band that rises while collapsing); on complete the page's animations are initialised and `ScrollTrigger.refresh(true)` runs. Panel is `#fff`, z-index 5,000,000.
- **Measured:** the PJAX navigation did **not** complete in headless Chromium (XHR `/work` → 301 → `/work/` succeeded, container never swapped, no error), from home, from the Work index and via REA and Playwright. Unknown whether this is environment-specific.
- **Tech:** Barba, GSAP. **Reproduce:** GSAP curtain around `router.push` (cover → swap → reveal, ≈ 1.3 s), a hard timeout that falls back to a normal navigation, focus moved to `<main>`, no curtain for reduced motion.

## 4. Header hide / show
- **What:** the fixed header slides off when scrolling down and returns on any upward scroll. **When:** scroll direction changes.
- **How:** `scroll` listener compares `scrollY` with the previous value; header stays visible while `scrollY ≤ innerHeight/2` or when scrolling up; class `header--hidden` → `translate: -50% -100%` with `transition: all .3s ease`. `mix-blend-mode: difference` keeps it legible over images. **Measured (900 px viewport):** visible at y = 259, hidden at y = 519, visible again after a 200 px upward scroll.
- **Reproduce:** same logic with `requestAnimationFrame`-throttled scroll and a visible header whenever it holds keyboard focus.

## 5. Flicker reveal (words)
- **What:** the words of a paragraph, nav item or label appear in random order, each stuttering on like a failing neon tube. **When:** after the loader/curtain for above-the-fold text; on scroll into view for the rest.
- **How (source):** Splitting.js splits into `.word` spans (set to `opacity: 0` up front); each word is tweened to `opacity: 1` over **1 s** with GSAP `RoughEase` (`template: circ.easeOut, strength: 4, points: 50, taper: 'out', randomize: true, clamp: true`), `stagger: { each: 0.08–0.09, from: 'random' }`, starting 0.3 s into the timeline; nav items are offset by `(index+1)·0.4 s`, social links by 0.25 s.
- **Reproduce:** GSAP SplitText (`aria: auto`) + `RoughEase`, own parameters, only under `prefers-reduced-motion: no-preference`.

## 6. Scramble-typewriter (characters)
- **What:** each character flashes a random letter, then settles to its real glyph, left to right. **Where:** header baseline, footer location/time, section titles, case-study titles.
- **How (source):** per char, a 0.03 s tween sets `innerHTML` to a random a–z letter with `repeat: 1`, `repeatRefresh: true`, `repeatDelay: 0.03`, then restores the original glyph; start offset `(position + 1) · 0.08 s`.
- **Reproduce:** GSAP ScrambleText with a code-flavoured glyph set (`01{}[]<>/#_`), keeping the real text in an `aria-label`.

## 7. Section reveal on scroll
- **What:** blocks of a section fade in as they enter. **When:** ScrollTrigger `start: "top bottom"`, `end: "bottom center+=200px"` (or `bottom center`).
- **How:** `[data-section-text-animation]` children go from `opacity: 0` to 1 with a delay of 0.2 s, or `(index+1)·0.3 s` for sections flagged `data-delay-animation`; on start, each contained image regenerates its distortion grid so the effect "lands" with the reveal. A `data-parallax-animation` attribute exists on the "Selected work" section, but **no parallax implementation was found in the application code** (Observed).
- **Reproduce:** ScrollTrigger batch per section, started once; no re-hiding on scroll back.

## 8. Ornament reveal
- **What:** the small triangles flanking titles fade in after the text. **How:** GSAP tweens the CSS variable `--triangle-opacity` 0 → 1 over 1 s (delay 1–1.3 s); pseudo-elements read it as `opacity`. **Reproduce:** the same pattern (animate a custom property, style reads it) for the new motif.

## 9. Magnetic button
- **What:** buttons and the logo drift toward the cursor when it is near. **When:** desktop pointer within about one button-width of the centre.
- **How (source):** each frame: `target = 0.3 · (cursor − centre)`; rendered value lerps toward it at `0.1`; applied as `translate3d`; disabled by a user-agent regex.
- **Measured (header CTA, 117 × 37 px):** cursor 59 px right of centre → button shifts 13.5 px; 106 px → 24.4 px (equilibrium ≈ 0.23 × offset because the centre moves with the button). At a 176 px offset the pull still held (32.6 px), larger than the nominal radius (Unknown why).
- **Reproduce:** `gsap.quickTo` on x/y, radius ≈ 1.2× width, only `(hover:hover) and (pointer:fine)`, returns to rest on leave/blur.

## 10. Image distortion (WebGL)
- **What:** an image breaks into blocky displaced tiles that follow the cursor and then relax. **When:** pointer moves over an image; the grid is also re-seeded when the image reveals.
- **How (source):** one `WebGLRenderer` + orthographic camera + one plane per `[data-image]`; a float `DataTexture` holds a 2-channel offset per grid cell (cell size **34 px**); the fragment shader samples the photo at `uv − 0.02·offset` after a cover-fit; each frame offsets decay by **×0.9** and cells within radius `0.25 × columns` of the cursor gain `strength(1) · 100 · velocity · power(clamped 0–10)`; velocity itself decays ×0.9. The loop never stops.
- **Measured:** mean absolute pixel difference vs the idle image (0–255): 9.3 right after a sweep → 5.2 (150 ms) → 3.6 (300 ms) → 2.2 (600 ms) → 0.85 (1 s) → 0.17 (1.8 s) → 0.05 (3 s). **Idle cost: 420 WebGL draw calls per second** (7 canvases × 60 fps) even with every image off-screen. Each canvas sits above the card link and swallows clicks.
- **Reproduce:** a ~150-line raw WebGL2 module (one quad, one 2-channel float texture), rendering only while energy > ε, only for visible cards, canvas `pointer-events: none` with listeners on the card, static `<img>` fallback.

## 11. Work-index hover
- **What:** hovering a row dims the other rows and scatters that project's four thumbnails across the viewport background. **When:** desktop pointer; disabled by the UA regex.
- **How (source):** CSS `:has()` fades sibling rows to 0.5 opacity; after a 20 ms debounce the project's `.thumbgrid` gets `--current` and a GSAP timeline animates its items from `opacity 0 / scale .5` with `stagger 0.045`, `expo`, 0.5 s; on leave a 0.3 s `power3` reverse. Thumbnails sit at fixed percentages of a 100 × 100 grid.
- **Measured:** the four thumbnails' opacity at 60 / 200 / 450 / 900 ms = [0.46,0,0,0] → [0.93,0.88,0.77,0.58] → [1,1,0.99,0.99] → [1,1,1,1]; gone 0.7 s after leaving.
- **Reproduce:** same structure with own positions, keyboard focus also triggers it, no effect on touch.

## 12. Case-study gallery
- **What:** a wide, slightly bent strip of images that follows wheel and drag with inertia and snaps to the nearest slide. **How (source):** OGL renderer, camera fov 45 at z = 20, 100 × 50 segment planes; wheel adds `pixelY · 0.025` to a target, drag adds `Δx · 0.07` (`0.15` on touch); `current` lerps to `target` at **0.05**; after 200 ms of silence the target snaps to a multiple of the slide width.
- **Reproduce:** deliberately **not** WebGL: CSS scroll-snap strip with pointer-drag inertia, keyboard arrows, visible focus.

## 13. Footer clock
- **What:** "LOCAL TIME ► 04:56 PM". **How (source):** 5 s `setInterval`; builds hours/minutes from `new Date()`; **shows the visitor's own time**, and its 12-hour logic mislabels 12:xx as AM (Observed). **Reproduce:** `Intl.DateTimeFormat` with the owner's timezone, correct AM/PM, 1 s tick, static `<time>` text for assistive tech.

## 14. Pages with their own routines
- **Design Lab:** typewriter title, canvas fade-in, flicker paragraph; page scroll locked while on it.
- **404:** flicker title, typewriter subtitle, flicker text and link with 0.6 s / 0.9 s offsets.

## 15. Gaps to close in the new build
Reduced-motion support; keyboard focus styling for every interactive effect; touch detection by capability, not UA; WebGL that sleeps; transition fallback; correct clock. See `06-implementation-plan.md` for the parity matrix.
