#!/usr/bin/env node
/**
 * Image pipeline: drop ORIGINAL images into assets-src/ (any folder structure, png / jpg /
 * webp / avif / tiff) and run `npm run images`. Optimised WebP copies are written to
 * public/images/ with the same relative path, e.g.
 *   assets-src/projects/skillsmatch/cover.png  ->  public/images/projects/skillsmatch/cover.webp
 * which you then reference as "/images/projects/skillsmatch/cover.webp" in src/content/.
 *
 * Max width 2000px (900px for files whose name starts with "profile"), quality 82, EXIF
 * orientation applied, metadata stripped. Unchanged files are skipped; use --force to redo all.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { root } from "./lib/content.mjs";

const SRC = path.join(root, "assets-src");
const OUT = path.join(root, "public", "images");
const force = process.argv.includes("--force");
const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".tif", ".tiff"]);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (exts.has(path.extname(e.name).toLowerCase())) yield p;
  }
}

let done = 0;
let skipped = 0;
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const out = path.join(OUT, rel.replace(/\.[^.]+$/, ".webp"));
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const maxWidth = /^profile/i.test(path.basename(file)) ? 900 : 2000;
  const info = await sharp(file).rotate().resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(out);
  console.log(`✓ ${rel}  →  /images/${rel.replace(/\.[^.]+$/, ".webp").split(path.sep).join("/")}  (${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB)`);
  done++;
}
if (!fs.existsSync(SRC)) console.log("No assets-src/ folder yet. Create it and drop original images there.");
else console.log(`${done} optimised, ${skipped} unchanged.`);
