#!/usr/bin/env node
/**
 * Tiny static server for the exported site (`out/`), with no dependencies.
 * Mirrors what a real static host does: /path/ -> /path/index.html, unknown -> 404.html,
 * brotli/gzip for text assets and long-lived immutable caching for hashed /_next/static files.
 * Usage: node scripts/serve.mjs [port]   (default 4173)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 80);

if (!fs.existsSync(root)) {
  console.error("out/ not found. Run `npm run build` first.");
  process.exit(1);
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json",
};
const compressible = new Set([".html", ".js", ".mjs", ".css", ".json", ".txt", ".xml", ".svg", ".webmanifest"]);
const compressed = new Map(); // `${enc}:${file}:${mtime}` -> Buffer

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const target = path.normalize(path.join(root, clean));
  if (!target.startsWith(root)) return null; // path traversal guard
  const candidates = [target, `${target}.html`, path.join(target, "index.html")];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

function send(req, res, status, file) {
  const ext = path.extname(file);
  const hashed = file.includes(`${path.sep}_next${path.sep}static${path.sep}`);
  const headers = {
    "Content-Type": types[ext] ?? "application/octet-stream",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
    Vary: "Accept-Encoding",
  };
  const accept = String(req.headers["accept-encoding"] ?? "");
  const enc = compressible.has(ext) ? (/\bbr\b/.test(accept) ? "br" : /\bgzip\b/.test(accept) ? "gzip" : null) : null;
  if (enc) {
    const key = `${enc}:${file}:${fs.statSync(file).mtimeMs}`;
    let body = compressed.get(key);
    if (!body) {
      const raw = fs.readFileSync(file);
      body =
        enc === "br"
          ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
          : zlib.gzipSync(raw, { level: 6 });
      compressed.set(key, body);
    }
    res.writeHead(status, { ...headers, "Content-Encoding": enc, "Content-Length": body.length });
    return res.end(body);
  }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const file = resolveFile(req.url ?? "/");
    if (file) return send(req, res, 200, file);
    const notFound = path.join(root, "404.html");
    return fs.existsSync(notFound) ? send(req, res, 404, notFound) : (res.writeHead(404), res.end("Not found"));
  })
  .listen(port, () => console.log(`Serving out/ at http://localhost:${port}`));
