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

Everything the site says lives in `src/content/`, and you never need to touch a component. **Read [`src/content/README.md`](src/content/README.md)**: it has a recipe for each task (availability, About, experience, projects, photo, CV, skills).

```bash
npm run dev                                   # live preview
npm run check                                 # validates content, tells you what to fix
npm run new:project -- my-slug "My Project"   # scaffold a hidden draft project
npm run images                                # optimise originals from assets-src/ into public/images/
npm run figures                               # regenerate generated project illustrations
```

`npm run build` runs the content check first, so a missing image, a broken link or leftover placeholder text stops the build with a plain-English message instead of reaching the live site. The CV download appears when a PDF exists in `public/cv/`. Set `NEXT_PUBLIC_SITE_URL` to your domain at build time (default `https://tahableu.me`).

## Deploying

Any static host. Build command `npm run build`, output directory `out`. Example: Cloudflare Pages.

## Design and engineering notes

See [`docs/website-reverse-engineering/`](docs/website-reverse-engineering/README.md) for the analysis of the reference site, the design system, the animation specs and the QA results.

## Accessibility and motion

`prefers-reduced-motion` disables the loader, page curtain, smooth scrolling, text reveals, magnetic pull and WebGL effect; without JavaScript everything is visible. Keyboard: skip link first, visible focus on every control.
