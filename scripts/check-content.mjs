#!/usr/bin/env node
/**
 * Content check: runs before every build (`npm run build`) and on demand (`npm run check`).
 * It reads src/content/*.ts and fails with a plain-English list of problems: missing images,
 * broken links, duplicate slugs, diagram typos, leftover "TODO" text… so mistakes are caught
 * here instead of on the live site. Warnings never fail the build.
 */
import fs from "node:fs";
import path from "node:path";
import { loadContent, publicFileExists, publicDir } from "./lib/content.mjs";

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`✗ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`! ${where}: ${msg}`);
const str = (v) => typeof v === "string" && v.trim().length > 0;
const isUrl = (v) => {
  try {
    return ["https:", "http:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

const [siteMod, projMod, expMod, skillMod] = await Promise.all(["site", "projects", "experience", "skills"].map(loadContent));
const { site } = siteMod;
const { allProjectEntries: entries } = projMod;
const { experience, education, competitions } = expMod;
const { skillGroups } = skillMod;

// ---- leftover placeholders -----------------------------------------------------------
function findTodo(value, where) {
  if (typeof value === "string") {
    if (/\bTODO\b/.test(value)) err(where, `contains placeholder text: "${value.slice(0, 60)}"`);
  } else if (Array.isArray(value)) value.forEach((v, i) => findTodo(v, `${where}[${i}]`));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) findTodo(v, `${where}.${k}`);
}

// ---- site ----------------------------------------------------------------------------
for (const k of ["name", "firstName", "lastName", "role", "summary", "blurb", "status"]) if (!str(site[k])) err("site.ts", `"${k}" is empty`);
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(site.contact?.email ?? "")) err("site.ts", "contact.email is not a valid email address");
for (const k of ["github", "linkedin"]) if (!isUrl(site.contact?.[k])) err("site.ts", `contact.${k} must be a full URL starting with https://`);
for (const k of ["kind", "duration", "start", "focus"]) if (!str(site.availability?.[k])) err("site.ts", `availability.${k} is empty`);
if (!publicFileExists(site.portrait?.src)) err("site.ts", `portrait.src "${site.portrait?.src}" does not exist in public/ (put the original in assets-src/ and run: npm run images)`);
if (!str(site.portrait?.alt)) err("site.ts", "portrait.alt is empty");
if (!["mono", "color"].includes(site.portrait?.treatment)) err("site.ts", 'portrait.treatment must be "mono" or "color"');
if (!Array.isArray(site.about) || !site.about.length || !site.about.every(str)) err("site.ts", "about must be a non-empty list of text paragraphs");
findTodo(site, "site.ts");

// ---- skills --------------------------------------------------------------------------
if (!skillGroups.length) err("skills.ts", "no skill groups");
skillGroups.forEach((g, i) => {
  if (!str(g.name)) err(`skills.ts[${i}]`, "group name is empty");
  if (!g.items?.length) err(`skills.ts "${g.name}"`, "group has no items");
});
findTodo(skillGroups, "skills.ts");

// ---- projects ------------------------------------------------------------------------
const slugs = new Set();
const published = entries.filter((e) => !e.draft);
for (const p of entries) {
  const w = `projects.ts "${p.slug ?? p.title ?? "?"}"`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? "")) err(w, 'slug must be lowercase letters, numbers and dashes, e.g. "my-project"');
  if (slugs.has(p.slug)) err(w, "slug is used twice");
  slugs.add(p.slug);
  if (p.draft) {
    warn(w, "is a DRAFT: hidden everywhere (remove `draft: true` to publish)");
    continue;
  }
  for (const k of ["title", "subtitle", "status", "summary"]) if (!str(p[k])) err(w, `"${k}" is empty`);
  if (!p.tags?.length) err(w, "needs at least one tag");
  else if (p.tags.length > 3) warn(w, "more than 3 tags will crowd the card");
  if (!p.stack?.length) err(w, "needs at least one stack item");
  if (p.ratio && !/^\d+(\.\d+)? \/ \d+(\.\d+)?$/.test(p.ratio)) err(w, `ratio must look like "3 / 2", got "${p.ratio}"`);

  // image: own cover, else a generated figure
  if (p.cover) {
    if (!publicFileExists(p.cover.src)) err(w, `cover.src "${p.cover.src}" not found in public/ (drop the original in assets-src/ and run: npm run images)`);
    if (!str(p.cover.alt)) err(w, "cover.alt is empty (describe the image)");
  } else if (!str(p.figure)) err(w, 'needs a `cover` image or a `figure` name (e.g. figure: "my-project", then npm run figures)');
  else if (!fs.existsSync(path.join(publicDir, "figures", `${p.figure}.svg`))) err(w, `figure "${p.figure}" has no public/figures/${p.figure}.svg yet: run npm run figures`);
  for (const [i, g] of (p.gallery ?? []).entries()) {
    if (!publicFileExists(g.src)) err(w, `gallery[${i}].src "${g.src}" not found in public/`);
    if (!str(g.alt)) err(w, `gallery[${i}].alt is empty`);
  }
  for (const [i, l] of (p.links ?? []).entries()) if (!isUrl(l.href) || !str(l.label)) err(w, `links[${i}] needs a label and a full https:// URL`);
  for (const [i, m] of (p.metrics ?? []).entries()) if (!str(m.value) || !str(m.label)) err(w, `metrics[${i}] needs a value and a label`);

  // diagram sanity
  if (p.diagram) {
    const ids = new Set();
    for (const n of p.diagram.nodes) {
      if (ids.has(n.id)) err(w, `diagram node id "${n.id}" is used twice`);
      ids.add(n.id);
      if (!str(n.label) || !Number.isInteger(n.col)) err(w, `diagram node "${n.id}" needs a label and an integer col`);
    }
    for (const e of p.diagram.edges) for (const end of [e.from, e.to]) if (!ids.has(end)) err(w, `diagram edge refers to unknown node "${end}"`);
    for (const id of p.diagram.boundary?.ids ?? []) if (!ids.has(id)) err(w, `diagram boundary refers to unknown node "${id}"`);
  }
  findTodo(p, w);
}
const featured = published.filter((p) => p.featured);
if (featured.length > 6) err("projects.ts", `${featured.length} projects are featured but the home grid shows at most 6: set featured: false on ${featured.length - 6}`);
if (!featured.length) warn("projects.ts", "no featured projects: the home page 'Selected work' section will be empty");

// ---- experience / education / competitions --------------------------------------------
experience.forEach((e, i) => {
  const w = `experience.ts experience[${i}] "${e.role ?? "?"}"`;
  for (const k of ["role", "org", "period"]) if (!str(e[k])) err(w, `"${k}" is empty`);
  if (!e.points?.length) warn(w, "no bullet points");
  if (e.projectSlug && !published.some((p) => p.slug === e.projectSlug)) err(w, `projectSlug "${e.projectSlug}" does not match a published project`);
});
education.forEach((e, i) => {
  for (const k of ["title", "org", "period"]) if (!str(e[k])) err(`experience.ts education[${i}]`, `"${k}" is empty`);
});
competitions.forEach((e, i) => {
  for (const k of ["title", "org", "period", "detail"]) if (!str(e[k])) err(`experience.ts competitions[${i}]`, `"${k}" is empty`);
});
findTodo({ experience, education, competitions }, "experience.ts");

// ---- assets --------------------------------------------------------------------------
const imgDir = path.join(publicDir, "images");
(function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (fs.statSync(p).size > 500 * 1024) warn(path.relative(publicDir, p), `is ${(fs.statSync(p).size / 1024).toFixed(0)} KB: run it through npm run images to shrink it`);
  }
})(imgDir);
const cvDir = path.join(publicDir, "cv");
const cv = fs.existsSync(cvDir) ? fs.readdirSync(cvDir).find((f) => f.toLowerCase().endsWith(".pdf")) : null;

// ---- report --------------------------------------------------------------------------
console.log(`Content check: ${published.length} projects (${featured.length} featured, ${entries.length - published.length} draft), ${experience.length} experience, ${education.length} education, ${competitions.length} competitions, ${skillGroups.length} skill groups. CV: ${cv ? cv : "none (no download button)"}.`);
warnings.forEach((w) => console.log(w));
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length > 1 ? "s" : ""} to fix before building:\n`);
  errors.forEach((e) => console.error(e));
  console.error("\nSee src/content/README.md for the field guide.");
  process.exit(1);
}
console.log("✓ All good.");
