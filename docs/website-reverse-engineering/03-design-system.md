# 03 — Visual design system of the reference

Values come from the shipped stylesheet (43 KB, E2/E3) and the screenshot matrix (E5). Pixel values assume the stylesheet's root size: **13 px below 768 px, 14 px from 768 px up**. All colour contrasts are computed (WCAG 2.x relative luminance), not estimated.

## 1. Identity in one paragraph

A near-black, almost monochrome canvas (`#161616`) where hierarchy is made with **type contrast rather than colour**: a hairline high-contrast serif set against a bold grotesque, uppercase display text at up to 86 px, micro-labels in a monospace at ~10 px, and a lot of empty space. Surfaces are flat (no shadows, no gradients), edges are 1 px rules, corners are 10 px. Photography carries all the colour and is unified by a grey tonal overlay. Small triangular ornaments and end-capped rules are the only decoration.

## 2. Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| UI, titles, body | **PP Neue Montreal** | Medium (500) | `:root` default; sans fallback only |
| Micro-labels, meta | **PP Neue Montreal Mono** | Medium | `.mono`, colour `#919191`, uppercase, ~10 px |
| Display accent, CTAs, arrows | **PP Eiko** | Thin | `.serif`; the hero name, "Skills" line, footer CTA, list titles, arrows |

No `letter-spacing` is set anywhere (default tracking). `line-height`: root 1.5; display 1; blurbs 1.23 (13 px) → 1.21 (14 px); footer title 1.04–1.1.

| Style | rem steps | Computed px |
|---|---|---|
| `.h1` (hero) | 2.3 → 2.5 (≥370) → 2.923 (≥402) → 4.571 (≥1024) → 6.143 (≥1280) | 30 → 32.5 → 38 (41 from 768) → 64 → **86** |
| `.h2` ("Selected work") | 2.923 → 4.357 (≥1024) | 38/41 → 61 |
| `.h3` | 1.692 → 2.125 (≥1024) | 22/24 → 30 |
| Work-index row title | 1.846 → 3.429 (≥1024) | 24/26 → 48 |
| Card title | 2.231 | 29/31 |
| Footer title | 2.462 → 3.786 (≥1024) | 32/34 → 53 |
| `.text-lg` (social links) | 1.231 | 16/17 |
| `.text-sm` (labels) | 0.769 → 0.6875 (≥768) | **10 → 9.6** (below common minimums) |

Transforms: hero, section titles, blurbs and list titles are `text-transform: uppercase`; the card title and footer title are sentence case. Mixed-style titles ("SELECTED **WORK.**", "SAMUEL SCALZO / DIGITAL DESIGNER") pair the thin serif with the bold sans on one baseline; a full stop or a triangle closes the line.

## 3. Colour

| Token (inferred name) | Hex | Used for | Contrast on `#161616` |
|---|---|---|---|
| page | `#161616` | `body`, loader, `theme-color` | n/a |
| surface | `#1b1b1b` | scrollbar track | 1.05:1 |
| text strong | `#ffffff` | titles, nav, social links | 18.10:1 |
| text muted | `#919191` | links, `.mono`, labels | 5.74:1 |
| text default | `#6b6b6c` | `:root` colour, justified blurbs | **3.40:1 (fails AA)** |
| rule | `#4a4a4a` | `hr`, card/footer borders, image overlay, scrollbar thumb | 2.04:1 (decorative) |
| button border | `#6b6b6c` | header CTA border | 3.40:1 |
| warm light | `#d8d4cf` | button hover background (variable, leftover from a demo) | n/a |
| accent pink | `#f2c8cc` | one occurrence (inner pages) | n/a |
| curtain | `#ffffff` | route-transition panel | n/a |

Gradients: none. Shadows: none. Blend modes: header `mix-blend-mode: difference` (keeps it legible over any content); image overlay `#4a4a4a`, 50 %, `hard-light`. Hover states: buttons invert to white fill with black text over 0.3 s; list rows dim siblings to 50 % opacity; text links do not change colour (they animate at reveal time instead).

## 4. Layout

- **Container:** `main` is full width with **18 px** gutters, **45 px** from 768 px, capped at **1560 px** from 1024 px (gutters removed again at ≥1536). The fixed header is capped at 1560–1580 px with 90 px side padding on desktop.
- **Grid:** 12 columns, 20 px column gap (≥1024); explicit `grid-area` per element (headings col 2, media cols 5–8, copy cols 9–12); `subgrid` for the Awards rows and the Work-index rows. Mobile: single column, text blocks at **78.46 %** width, centred.
- **Section rhythm:** `clamp(90px, 9.375vw, 180px)` above and below major sections; stack gaps 20 / 30 / 50 / 70 / 90 px.
- **Intro:** 100 vh, padding-top 29 vh (27 vh desktop), title offset 20 vh from the blurb.
- **Breakpoints (min-width, mobile-first):** 370, 402, 428, 430, **768**, **1024**, **1280**, 1536, 2000; plus a handful of height queries (600/805/840/990/1100 px) used by the Work index. One `(hover: hover) and (pointer: fine)` query.

## 5. Visual elements

| Element | Spec |
|---|---|
| Radius | 10 px (images, cards, footer card), 5 px (buttons), 50 % (button hover filler) |
| Borders | 1 px `#4a4a4a`; footer card 1 px; header button 1 px `#6b6b6c` |
| Rules (`hr`) | 1 px `#4a4a4a`, 9 px triangle end-caps (left, and rotated 180° right) |
| Ornament | 8×6 px white triangle (`▲`) after hero second line, "Selected work.", footer title, case-study title, Work-index titles; opacity driven by `--triangle-opacity` |
| Image treatment | `#4a4a4a` hard-light overlay at 50 %; portrait `object-position: top`; cards 300 px tall on mobile, fill their grid area on desktop; WebGL grid distortion on hover |
| Header | Fixed, `mix-blend-mode: difference`, white logo; baseline "— NAME" (≥1024) |
| Footer | Bordered 10 px card; large sans CTA, serif "→ SEND ME AN EMAIL", live local time, socials, credits row with top rule |
| Scrollbar | `scrollbar-width: thin`, thumb `#4a4a4a` on `#1b1b1b`; `overscroll-behavior-y: none` |
| Cursor | Only `cursor: pointer` on links/buttons; no custom cursor on the pages analysed |
| Focus | No `:focus-visible` styling; `.button:focus` removes the outline |

## 6. Motion tokens (CSS side)

`0.3s ease` for UI transitions (×8 uses); loader slide `translate 3s ease .3s` + `opacity .3s ease .7s`; keyframe `transition` 1.6 s `cubic-bezier(.76,0,.24,1)` (declared but superseded by the GSAP curtain). The animation vocabulary itself is documented in `04-animations-interactions.md`.

## 7. Approximate tokens (for analysis only, not for reuse)

```css
:root {
  --ref-bg: #161616;   --ref-surface: #1b1b1b;
  --ref-text-strong: #fff;  --ref-text-muted: #919191;  --ref-text-default: #6b6b6c;
  --ref-rule: #4a4a4a;
  --ref-radius-card: 10px;  --ref-radius-button: 5px;
  --ref-container: 1560px;  --ref-gap: 20px;
  --ref-gutter: 18px;  /* 45px ≥768 */
  --ref-section-space: clamp(90px, 9.375vw, 180px);
  --ref-font-root: 13px;  /* 14px ≥768 */
}
```

## 8. Visual reference gallery (third-party captures, for analysis only)

| Frame | Observation |
|---|---|
| ![loader](assets/ref/desktop-1440/00-loader.png) | Loader: two percentage counters flanking a faceted mark; dark panel, no other UI |
| ![hero](assets/ref/desktop-1440/01-hero.png) | Hero: header (baseline · mark · nav), mono labels, justified blurb, thin-serif name over bold-sans title with triangles, socials |
| ![about/skills](assets/ref/desktop-1440/02-scroll-1.png) | `hr` with end-caps, About (portrait mid-distortion), Skills serif line mid-flicker |
| ![awards/selected](assets/ref/desktop-1440/03-scroll-2.png) | Awards ledger and the "SELECTED **WORK.**" title |
| ![cards](assets/ref/desktop-1440/04-scroll-3.png) | Staggered cards: image, mono meta row, title + arrow, rule |
| ![cards 2](assets/ref/desktop-1440/05-scroll-4.png) | Cards at different widths and offsets |
| ![footer](assets/ref/desktop-1440/08-footer.png) | Bordered footer card, serif CTA, local time, credits |
| ![distortion](assets/ref/interactions/hover-1-after-sweep.png) | WebGL displacement grid right after a cursor sweep |
| ![work hover](assets/ref/interactions/works-hover.png) | Work index: row title list, siblings dimmed, four thumbnails scattered |

## 8b. What carries the "premium" feel (design reading)

1. **Scale contrast**: 86 px display against 10 px labels, with almost nothing in between.
2. **Two-voice typography**: hairline serif + heavy sans, never mixed within a word.
3. **Restraint**: one background, three greys, white; colour only from photography.
4. **Rhythm by asymmetry**: hand-placed grid areas rather than uniform tiling.
5. **Motion as texture**: text powers on (flicker/scramble), images react to the pointer, pages wipe.
