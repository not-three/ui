import { existsSync, statSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VENDOR_PATHS } from "~/lib/sandbox/vendor";

const vendorDir = join(__dirname, "..", "..", "..", "public", "vendor");
const digest = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

/** Total bytes of a file or directory tree. */
function sizeOf(path: string): number {
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.size;
  return readdirSync(path).reduce((sum, entry) => sum + sizeOf(join(path, entry)), 0);
}

// Per-engine ceilings in MB. Selective copies must stay well under these;
// a blanket package copy blows straight through them. The five small ones
// (react, sql.js, wasmoon, jscpp, svelte) are set to roughly measured size +
// 40% rather than a round "obviously small" number — a loose budget here
// (e.g. react's original 2 MB against a 0.14 MB actual) would hide a
// partial regression, such as a second build variant sneaking back in,
// until it was already most of the way to blowing the ceiling.
const BUDGET_MB: Record<string, number> = {
  pyodide: 30,
  "ruby-wasm": 60,
  "php-wasm": 60,
  pglite: 30,
  "sql.js": 1,
  mermaid: 8,
  svelte: 1.6,
  typescript: 15,
  react: 0.3,
  vue: 3,
  wasmoon: 0.6,
  babel: 4,
  coffeescript: 2,
  jscpp: 0.6,
  "picoc-js": 3,
  markdown: 2,
};
const TOTAL_BUDGET_MB = 200;

// Hosts confirmed (or preemptively suspected, same package class) to appear
// as hardcoded default fetch targets inside vendored interpreter packages.
// scripts/copy-sandbox-vendor.mjs neutralises these post-copy; this assertion
// is what makes that mechanical and durable against future dependency bumps
// silently reintroducing one, across all 18 engines.
const CDN_HOSTS = ["cdn.jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com", "esm.sh"];

describe("vendor pipeline", () => {
  it("ships the original image wasm files and separate libheif module with licence notices", () => {
    const assets: [string, string, string][] = [
      ["avif", "codec/enc/avif_enc.wasm", "avif_enc.wasm"],
      ["jxl", "codec/dec/jxl_dec.wasm", "jxl_dec.wasm"],
      ["webp", "codec/enc/webp_enc.wasm", "webp_enc.wasm"],
      ["png", "codec/pkg/squoosh_png_bg.wasm", "squoosh_png_bg.wasm"],
      ["jpeg", "codec/enc/mozjpeg_enc.wasm", "mozjpeg_enc.wasm"],
    ];
    for (const [name, source, copied] of assets) {
      expect(digest(join(vendorDir, "image", name, copied)))
        .toBe(digest(join(__dirname, "..", "..", "..", "node_modules", "@jsquash", name, source)));
      expect(existsSync(join(vendorDir, "image", name, "LICENSE"))).toBe(true);
    }
    expect(digest(join(vendorDir, "image", "heic", "libheif-bundle.mjs")))
      .toBe(digest(join(__dirname, "..", "..", "..", "node_modules", "libheif-js", "libheif-wasm", "libheif-bundle.mjs")));
    expect(existsSync(join(vendorDir, "image", "heic", "LICENSE"))).toBe(true);
  });
  it("every VENDOR_PATHS entry exists under public/vendor (run pnpm install if this fails)", () => {
    for (const [key, rel] of Object.entries(VENDOR_PATHS)) {
      const target = join(vendorDir, rel);
      expect(existsSync(target), `${key} -> public/vendor/${rel}`).toBe(true);
    }
  });

  it("bundles React into one script exposing the React and ReactDOM globals", () => {
    const bundle = join(vendorDir, VENDOR_PATHS.react);
    const sandbox: Record<string, unknown> = {};
    new Function("window", "self", "globalThis", readFileSync(bundle, "utf8"))(sandbox, sandbox, sandbox);
    const React = sandbox.React as { createElement?: unknown; version?: string };
    const ReactDOM = sandbox.ReactDOM as { createRoot?: unknown };
    expect(typeof React?.createElement).toBe("function");
    expect(typeof ReactDOM?.createRoot).toBe("function");
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

  it("ships no hardcoded CDN URLs (the app must load everything from its own origin)", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(m?js|cjs|json)$/i.test(entry.name)) continue;
        const contents = readFileSync(full, "utf8");
        if (CDN_HOSTS.some((host) => contents.includes(host))) offenders.push(full);
      }
    };
    if (existsSync(vendorDir)) walk(vendorDir);
    expect(
      offenders,
      `these vendored files still reference a CDN host (${CDN_HOSTS.join(", ")}) — the copy script's sanitisation pass should have rewritten them:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
