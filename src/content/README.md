# Editing your portfolio

Everything the site says lives in this folder. You never need to touch a component to change
text, projects, experience or images. After any change:

```bash
npm run dev      # preview at http://localhost:3000 (updates as you save)
npm run check    # validates your content and tells you exactly what to fix
npm run build    # production build (runs the check first, so mistakes can't ship)
```

## What to edit for what

| I want to… | Edit |
|---|---|
| Change my availability (PFE, duration, start date, focus) | `site.ts` → `availability` (feeds the hero pill, About text, footer, page descriptions) |
| Change my name, role, tagline, About text, links, languages | `site.ts` |
| Change my photo | `site.ts` → `portfolio` (see "Images" below) |
| Add / edit a job or internship | `experience.ts` → `experience` |
| Edit education or hackathons | `experience.ts` → `education`, `competitions` |
| Add / edit / reorder / hide a project | `projects.ts` |
| Change skills | `skills.ts` |
| Replace the CV | put the new PDF in `public/cv/` (delete the old one); the download link appears automatically |
| Change colours or fonts | `../styles/tokens.css` |

Order in a list = order on the site. Counters ("Work 07", "Project /03", "3 Projects") are automatic.

## Recipes

**Add an experience.** Copy a block in `experience.ts → experience`, paste it at the top (newest first), edit the fields. Add `projectSlug: "my-project"` to show a "Read the case study →" link.

**Add a project.**
```bash
npm run new:project -- my-project "My Project"
```
This adds a hidden *draft* to `projects.ts` (with a generated illustration so it already has an image). Replace every `TODO`, delete the line `draft: true`, then `npm run check`. A project with leftover `TODO` text cannot be built, so placeholders never reach the site.

**Use real screenshots instead of the generated illustration.**
1. Put the original in `assets-src/projects/my-project/` (png, jpg, webp…).
2. `npm run images` (creates optimised WebP in `public/images/projects/my-project/`).
3. In the project, add:
```ts
cover: { src: "/images/projects/my-project/cover.webp", alt: "What the image shows", fit: "cover" },
gallery: [{ src: "/images/projects/my-project/screen-2.webp", alt: "…", caption: "Optional caption" }],
```
`cover` is used on the home card, the index and the first gallery slide; `gallery` images follow, then the architecture diagram (if you gave one). Always write a real `alt`.

**Hide a project temporarily:** add `draft: true`. **Remove it from the home page but keep it on /projects:** `featured: false` (the home grid shows at most 6).

**Replace my photo.** Put the original in `assets-src/profile.jpg` (crop it roughly 4:5, head and shoulders), run `npm run images`, keep `src: "/images/profile.webp"` in `site.ts`. `treatment: "mono"` = black & white to match the design; `"color"` = original colours. `position` moves the crop (e.g. `"50% 15%"` shows more of the top).

**Change the social preview image** (links shared on LinkedIn, WhatsApp…): replace `src/app/opengraph-image.png` and `twitter-image.png` with a 1200×630 PNG.

## Project fields

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | lowercase-with-dashes; it is the page URL `/projects/<slug>/` |
| `title`, `subtitle`, `status`, `summary` | yes | `summary` is the main paragraph |
| `tags` | yes | 1-3 short keywords (shown on the card) |
| `stack` | yes | technologies used |
| `year`, `role`, `context` | no | shown in the facts column ("Capgemini Engineering…") |
| `highlights` | no | bullet list: what you concretely did |
| `metrics` | no | big numbers: only real, verifiable ones |
| `links` | no | `{ label, href }`, full `https://` URLs; no link = no button |
| `cover`, `gallery` | one of `cover` / `figure` | real images (see above) |
| `figure`, `figureAlt` | | name of a generated illustration in `public/figures/` |
| `diagram` | no | conceptual architecture drawing from nodes and edges (see an existing one) |
| `ratio` | no | card shape on the home page, default `"3 / 2"` |
| `featured` | yes | show on the home grid |
| `draft` | no | `true` = hidden everywhere |

Generated illustrations: `npm run figures` creates one for every project that has a `figure` and no `cover`. For a hand-drawn one, add a drawing function in `scripts/build-figures.mjs`.

## House rules

- **Facts only.** No invented metrics, no placeholder links: leave a field out rather than guess.
- Keep these `.ts` files **self-contained** (no `import` lines). The build checks read them with the TypeScript compiler, which is what lets them run on Node 20 inside Docker.
- Never edit `public/images/` by hand; edit the original in `assets-src/` and re-run `npm run images`.
