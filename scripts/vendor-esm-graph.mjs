import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Lists `entry` plus every sibling .js file it reaches through relative static
 * or dynamic imports, so a vendored ESM bundle ships whatever chunk names the
 * installed release uses. Files that do not exist are still listed, so the
 * copy step reports them as MISSING instead of silently dropping them.
 */
export function esmImportGraph(dir, entry) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const path = join(dir, file);
    if (!existsSync(path)) return;
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']\.\/([^"']+\.js)["']/g)) visit(match[1]);
  };
  visit(entry);
  return [...seen];
}
