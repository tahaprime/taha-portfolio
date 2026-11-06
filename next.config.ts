import type { NextConfig } from "next";

/**
 * Static export: every route is prerendered to plain HTML + a client payload,
 * so the site can be served by any static host (Cloudflare Pages, Netlify, S3…).
 *
 * - `trailingSlash` emits /projects/index.html, which works on every static host
 *   without rewrite rules and keeps canonical URLs predictable.
 * - `images.unoptimized` is required by static export; responsive WebP renditions
 *   are produced ahead of time by `scripts/build-figures.mjs`.
 * - Cache Components / partial prefetching (enabled by the scaffold) are server
 *   features that conflict with `generateStaticParams` + `dynamicParams = false`,
 *   so they are intentionally off.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
