# Taha Hoummadi — portfolio

Static-export **Next.js 16** portfolio (TypeScript, CSS Modules, GSAP, Lenis). Light and dark themes, accessible by default, no analytics, no backend.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ (needs network once, to fetch the font files)
npm run preview    # serves out/ at http://localhost:4173 with brotli + immutable caching
npm run lint && npm run typecheck
```

## Editing content

Everything the site says lives in `src/content/`:

| File | What |
|---|---|
| `site.ts` | Name, role, status, contact links, about copy, headline figures |
| `projects.ts` | Projects: summary, stack, metrics, links, conceptual diagram |
| `skills.ts`, `experience.ts` | Skill groups; experience, education, competitions |

Add your CV by putting a PDF in `public/cv/` and rebuilding: the download link appears automatically (and never exists without a file). Set `NEXT_PUBLIC_SITE_URL` to your domain at build time (default `https://tahableu.me`).

Project plates are generated artwork: edit `scripts/build-figures.mjs`, then `npm run figures`.

## Deploying

Any static host. Build command `npm run build`, output directory `out`. Example: Cloudflare Pages.

## Design and engineering notes

See [`docs/website-reverse-engineering/`](docs/website-reverse-engineering/README.md) for the analysis of the reference site, the design system, the animation specs and the QA results.

## Accessibility and motion

`prefers-reduced-motion` disables the loader, page curtain, smooth scrolling, text reveals, magnetic pull and WebGL effect; without JavaScript everything is visible. Keyboard: skip link first, visible focus on every control.
