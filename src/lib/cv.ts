import fs from "node:fs";
import path from "node:path";

/**
 * Build-time lookup for the CV. The download button renders only if a PDF exists
 * in `public/cv/`, so the site can never ship a dead link. Drop your PDF there
 * (any file name ending in .pdf) and rebuild.
 */
export function getCvHref(): string | null {
  try {
    const dir = path.join(process.cwd(), "public", "cv");
    const file = fs.readdirSync(dir).find((f) => f.toLowerCase().endsWith(".pdf"));
    return file ? `/cv/${encodeURIComponent(file)}` : null;
  } catch {
    return null;
  }
}
