/**
 * Loads the typed content files (src/content/*.ts) from plain Node scripts.
 * Works on Node 18+ (the Docker image uses Node 20): the TypeScript compiler that is
 * already a devDependency strips the types, then the result is imported as an ES module.
 * Content files must therefore stay self-contained (no relative imports).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const contentDir = path.join(root, "src", "content");
export const publicDir = path.join(root, "public");

export async function loadContent(name) {
  const file = path.join(contentDir, `${name}.ts`);
  const source = fs.readFileSync(file, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText).toString("base64");
  try {
    return await import(url);
  } catch (e) {
    throw new Error(`Could not load src/content/${name}.ts: ${e.message}`);
  }
}

/** True if a public-relative URL like "/images/a.webp" exists on disk. */
export const publicFileExists = (url) => typeof url === "string" && url.startsWith("/") && fs.existsSync(path.join(publicDir, url));
