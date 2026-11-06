#!/usr/bin/env node
/**
 * Scaffold a new project: npm run new:project -- my-slug "My Project Title"
 * Adds a hidden DRAFT entry to src/content/projects.ts, creates assets-src/projects/<slug>/
 * for your original images and generates the placeholder-free illustration for it.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { root, contentDir } from "./lib/content.mjs";

const [slug, ...rest] = process.argv.slice(2).filter((a) => a !== "--");
const title = rest.join(" ").trim();
if (!slug || !title || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run new:project -- my-slug "My Project Title"\n  (slug = lowercase letters, numbers and dashes)');
  process.exit(1);
}
const file = path.join(contentDir, "projects.ts");
const src = fs.readFileSync(file, "utf8");
if (src.includes(`slug: "${slug}"`)) {
  console.error(`A project with slug "${slug}" already exists.`);
  process.exit(1);
}
const marker = "  // <<< NEW PROJECTS ARE INSERTED ABOVE THIS LINE";
if (!src.includes(marker)) {
  console.error("Insertion marker not found in src/content/projects.ts. Add the entry by hand (see src/content/README.md).");
  process.exit(1);
}
const stub = `  {
    slug: "${slug}",
    title: ${JSON.stringify(title)},
    subtitle: "TODO: one line under the title",
    year: "TODO",
    status: "TODO",
    tags: ["TODO"],
    summary: "TODO: the main paragraph",
    stack: ["TODO"],
    // A real image wins over the generated illustration. To use one:
    //   1. drop it in assets-src/projects/${slug}/cover.png   2. npm run images
    //   3. replace the next two lines with:  cover: { src: "/images/projects/${slug}/cover.webp", alt: "…" },
    figure: "${slug}",
    figureAlt: "Generated figure for ${title.replace(/"/g, "'")}.",
    featured: false,
    draft: true, // delete this line to publish
  },
`;
fs.writeFileSync(file, src.replace(marker, stub + marker));
fs.mkdirSync(path.join(root, "assets-src", "projects", slug), { recursive: true });
execFileSync(process.execPath, [path.join(root, "scripts", "build-figures.mjs")], { stdio: "inherit" });
console.log(`\n✓ Added draft "${title}" to src/content/projects.ts\n  Next: replace every TODO, delete \`draft: true\`, then npm run check && npm run dev`);
