import { existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VENDOR_PATHS } from "~/lib/sandbox/vendor";

const vendorDir = join(__dirname, "..", "..", "..", "public", "vendor");

/** Total bytes of a file or directory tree. */
function sizeOf(path: string): number {
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.size;
  return readdirSync(path).reduce((sum, entry) => sum + sizeOf(join(path, entry)), 0);
}

// Per-engine ceilings in MB. Selective copies must stay well under these;
// a blanket package copy blows straight through them.
const BUDGET_MB: Record<string, number> = {
  pyodide: 30,
  "ruby-wasm": 60,
  "php-wasm": 60,
  pglite: 30,
  "sql.js": 5,
  mermaid: 8,
  svelte: 6,
  typescript: 15,
  react: 2,
  vue: 3,
  wasmoon: 2,
  babel: 4,
  coffeescript: 2,
  jscpp: 2,
  "picoc-js": 3,
};
const TOTAL_BUDGET_MB = 200;

describe("vendor pipeline", () => {
  it("every VENDOR_PATHS entry exists under public/vendor (run pnpm install if this fails)", () => {
    for (const [key, rel] of Object.entries(VENDOR_PATHS)) {
      const target = join(vendorDir, rel);
      expect(existsSync(target), `${key} -> public/vendor/${rel}`).toBe(true);
    }
  });

  it("stays inside the per-engine size budgets", () => {
    for (const [dir, budget] of Object.entries(BUDGET_MB)) {
      const path = join(vendorDir, dir);
      if (!existsSync(path)) continue;
      const mb = sizeOf(path) / 1048576;
      expect(mb, `public/vendor/${dir} is ${mb.toFixed(1)} MB (budget ${budget} MB)`).toBeLessThan(budget);
    }
  });

  it("stays inside the total size budget", () => {
    const mb = sizeOf(vendorDir) / 1048576;
    expect(mb, `public/vendor total is ${mb.toFixed(1)} MB`).toBeLessThan(TOTAL_BUDGET_MB);
  });

  it("ships no source maps or type declarations", () => {
    const junk: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(map|d\.ts)$/.test(entry.name)) junk.push(full);
      }
    };
    if (existsSync(vendorDir)) walk(vendorDir);
    expect(junk, `remove these from the copy list:\n${junk.join("\n")}`).toEqual([]);
  });
});
