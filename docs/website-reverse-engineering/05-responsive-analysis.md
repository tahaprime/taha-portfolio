# 05 — Responsive behaviour of the reference

Captured at 1440×900, 1024×768, 768×1024 and 390×844 (REA scenarios E5, motion enabled, light scheme; the page is dark by design). REA cannot emulate touch or a mobile user-agent, so narrow-viewport runs show the **CSS layout** with desktop pointer features still active; touch behaviour below is read from source.

## 1. Breakpoints (mobile-first, `min-width`)

| From | What changes (Observed in CSS unless noted) |
|---|---|
| base (< 370) | Single column; root 13 px; H1 30 px; text blocks 78.46 % wide and centred; header = centred logo + right-aligned stacked nav; `main` padding 18 px |
| 370 / 402 | H1 steps to 32.5 px, then 38 px |
| 428 / 430 | Small type/spacing refinements (a handful of rules) |
| **768** | Root becomes 14 px; `main` padding 45 px; `.text-sm` shrinks (10 → 9.6 px); **project cards become a two-column grid** (Observed in screenshot); header stays stacked |
| **1024** | Desktop composition: 12-column grids (20 px gap), container capped at 1560 px, header gains the "— NAME" baseline and an inline nav, hero/About/Skills/Awards placed by `grid-area`, **editorial staggered "Selected work" grid**, footer card spans `100vw − 90 px`; H1 64 px (77 of the ≈ 139 `@media` blocks in the stylesheet target this breakpoint) |
| 1280 | H1 86 px |
| 1536 | `main` side padding removed (content centred at 1560 px) |
| 2000 | One refinement rule |
| Height queries | `max-height: 600/805/840` and `min-height: 840/990/1100` combined with width, used by the Work-index and hero spacing |
| `(hover:hover) and (pointer:fine)` | One query only; the JS instead sniffs the user-agent |

## 2. Layout by viewport

| Area | 390 (mobile) | 768 (tablet) | 1024 / 1440 (desktop) |
|---|---|---|---|
| Header | Centred mark; nav stacked at right (Work⁰⁶, Design Lab, Email me); no baseline; no hamburger | Same, wider margins | Baseline left, mark centred, nav inline right; `Email me` is an outlined button |
| Intro | Labels in one row, blurb, title (30–38 px), socials row at the bottom of the 100 vh screen | Same stack, more air | 12-col: labels cols 2–8, blurb cols 9–12, title cols 2–11 (86 px at ≥1280), socials cols 5–9 |
| About | Text, then portrait (full width, 306:373) | Same | Heading col 2, portrait cols 5–8, text cols 9–12 |
| Skills | Serif line wraps over 5 lines (24 px) | Wraps | One display sentence cols 5–12 |
| Awards | Each award stacks: organisation, award, count right-aligned | Stacked | Three aligned columns |
| Selected work | One column; card images 300 px tall; 70 px gaps | **Two columns** of equal cards | Staggered editorial grid: six hand-placed areas of different widths |
| Footer | Bordered card; title, CTA, time, socials, logo + credits stacked | Same | Wide card: title/location left, CTA/time right, credits row |

Representative frames (all third-party captures for analysis):

| Mobile 390 | Tablet 768 | Laptop 1024 |
|---|---|---|
| ![m-hero](assets/ref/mobile-390/01-s00_hero.png) | ![t-hero](assets/ref/tablet-768/01-s00_hero.png) | ![l-hero](assets/ref/laptop-1024/01-s00_hero.png) |
| ![m-awards](assets/ref/mobile-390/03-s02.png) | ![t-cards](assets/ref/tablet-768/04-s03.png) | ![l-cards](assets/ref/laptop-1024/05-s04.png) |
| ![m-footer](assets/ref/mobile-390/12-s11_footer.png) | | |

## 3. Behaviour gated by device

- `isMobile()` is a **user-agent regex**. When true: no magnetic buttons, no Work-index hover cluster, WebGL grids are generated at init only (not on resize).
- Mouse-driven effects (distortion, magnetic pull) have no touch alternative; the WebGL canvases still render on phones.
- `Lenis` smooths wheel input only; touch scrolling stays native.
- The intro and loader use `100vh`, which on mobile browsers with a collapsing toolbar can crop content (`dvh/svh` would avoid it).

## 4. Observed responsive defects

1. **1024×768:** in one captured frame a project title detaches from its row (title shifted left of the grid, arrow wrapped to the next line), likely a flex/animation interaction in `.selected__el__title`; not reproducible at other widths.
2. Micro-labels are 9.6–10 px at every width.
3. Tablet keeps the stacked mobile nav, so four links occupy a tall column at the top right instead of a compact bar.
4. No safe-area handling; no landscape-phone height tuning beyond a few height queries.

## 5. What the new build adopts

- Same mobile-first `min-width` model with **768 / 1024 / 1280 / 1536**; layout switches at 768 (2-up cards) and 1024 (12-column editorial grid).
- Fluid type with `clamp()` instead of stepped sizes, a **minimum 11 px** for labels, and `dvh/svh` for full-screen sections.
- A real compact mobile nav (disclosure button, `aria-expanded`, focus trap not required, `Esc` closes) instead of four stacked links.
- Capability detection (`(hover:hover) and (pointer:fine)`, `prefers-reduced-motion`), never the user-agent.
- Touch alternatives: tap-to-reveal for the Work-index preview, static figures instead of WebGL.
- Verification at the same four viewports plus 320 px and 1920 px, in both themes (see `06-implementation-plan.md`).
