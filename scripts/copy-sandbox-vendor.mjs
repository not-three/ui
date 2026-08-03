// Copies self-hosted sandbox interpreter assets from node_modules into
// public/vendor/. public/vendor is gitignored: it is derived output,
// regenerated on every install so nothing is hardcoded into the repo and
// the app never contacts a CDN at runtime (privacy requirement).
//
// Copies are SELECTIVE: only the files a runner actually loads. Blanket
// package copies would add ~300 MB to the image (php-wasm alone is 182 MB
// unpacked); tests/lib/sandbox/vendor.test.ts enforces the budgets.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modules = join(root, "node_modules");
const target = join(root, "public", "vendor");

const JUNK = /\.(map|d\.ts|md|txt)$/i;

/**
 * Engines and the files they need.
 * - files: exact filenames inside `from`, copied into `to`.
 * - dir: copy the whole directory, skipping JUNK and `skip` entries.
 * Fill/adjust from the Step-1 `ls` output — every path is asserted by the
 * vendor test, so a wrong name fails loudly instead of silently.
 */
const ENGINES = [
  {
    from: "pyodide",
    to: "pyodide",
    files: [
      "pyodide.js",
      "pyodide.mjs",
      "pyodide.asm.js",
      "pyodide.asm.wasm",
      "python_stdlib.zip",
      "pyodide-lock.json",
    ],
  },
  { from: "wasmoon/dist", to: "wasmoon", dir: true },
  { from: "sql.js/dist", to: "sql.js", files: ["sql-wasm.js", "sql-wasm.wasm"] },
  // pglite/dist also ships ~150 optional Postgres extension .tar.gz files and
  // contrib/fs/live/vector/worker/ subtrees (extra build variants). Only the
  // core engine that `new PGlite()` loads is copied: the ESM entry, its five
  // chunk-*.js dependencies (verified via static import graph), and the
  // Postgres wasm binary + preload data it fetches by relative URL.
  {
    from: "@electric-sql/pglite/dist",
    to: "pglite",
    files: [
      "index.js",
      "chunk-A7RFOIQ7.js",
      "chunk-BTBUZ646.js",
      "chunk-EADU5A67.js",
      "chunk-STOZMFXW.js",
      "chunk-WGR4JCLS.js",
      "postgres.js",
      "postgres.wasm",
      "postgres.data",
    ],
  },
  { from: "typescript/lib", to: "typescript", files: ["typescript.js"] },
  {
    from: "coffeescript/lib/coffeescript-browser-compiler-legacy",
    to: "coffeescript",
    files: ["coffeescript.js"],
  },
  { from: "@babel/standalone", to: "babel", files: ["babel.min.js"] },
  { from: "react/umd", to: "react", files: ["react.production.min.js"] },
  { from: "react-dom/umd", to: "react", files: ["react-dom.production.min.js"] },
  { from: "vue/dist", to: "vue", files: ["vue.global.prod.js"] },
  { from: "vue3-sfc-loader/dist", to: "vue", files: ["vue3-sfc-loader.js"] },
  // svelte needs its ESM source tree (compiled components import
  // "svelte/internal/*", which reaches into src/constants.js, src/utils.js,
  // src/escaping.js, src/reactivity/* and src/legacy/legacy-client.js — verified
  // by grepping the internal/ import graph). src/compiler/ (1.7 MB) is the
  // *source* of the compiler and is never imported by that runtime graph, so
  // it is skipped; the prebuilt browser bundle at svelte/compiler/index.js
  // covers compilation instead.
  { from: "svelte/src", to: "svelte/src", dir: true, skip: ["compiler"] },
  { from: "svelte/compiler", to: "svelte/compiler", dir: true },
  // The npm package's only auto-executing browser bundle,
  // dist/browser.script.iife.js, hardcodes a fetch to
  // https://cdn.jsdelivr.net at import time — unacceptable for a
  // zero-external-request app. dist/browser.umd.js exports the same
  // DefaultRubyVM() API with no side effects and no CDN reference; the
  // runner fetches ruby+stdlib.wasm itself from this vendor path instead.
  {
    from: "@ruby/3.4-wasm-wasi/dist",
    to: "ruby-wasm",
    files: ["browser.umd.js", "ruby+stdlib.wasm"],
  },
  // php-wasm ships 12 PHP version/variant builds (182 MB total). Only the
  // 8.4 non-SDL web build is copied — the one PhpWeb.mjs selects by default
  // — plus the small ESM wrapper modules php-tags.mjs transitively imports
  // (verified via their import graphs) and the one wasm binary that build
  // loads by relative URL.
  {
    from: "php-wasm",
    to: "php-wasm",
    files: [
      "php-tags.mjs",
      "PhpWeb.mjs",
      "PhpBase.mjs",
      "webTransactions.mjs",
      "OutputBuffer.mjs",
      "_Event.mjs",
      "fsOps.mjs",
      "resolveDependencies.mjs",
      "php8.4-web.mjs",
      "e31ec3faf3e2323a2b4a448342b50307765b8217.wasm",
    ],
  },
  { from: "mermaid/dist", to: "mermaid", files: ["mermaid.min.js"] },
  { from: "jscpp/dist", to: "jscpp", files: ["JSCPP.es5.min.js"] },
  { from: "picoc-js/dist", to: "picoc-js", files: ["bundle.js"] },
];

function copyFiltered(from, to, skip = []) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (skip.includes(entry.name) || JUNK.test(entry.name)) continue;
    const src = join(from, entry.name);
    const dest = join(to, entry.name);
    if (entry.isDirectory()) copyFiltered(src, dest, skip);
    else cpSync(src, dest, { dereference: true });
  }
}

function sizeOf(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.size;
  return readdirSync(path).reduce((sum, e) => sum + sizeOf(join(path, e)), 0);
}

rmSync(target, { recursive: true, force: true });
let ok = 0;
let missing = 0;
for (const engine of ENGINES) {
  const from = join(modules, engine.from);
  if (!existsSync(from)) {
    console.warn(`[vendor] MISSING node_modules/${engine.from}`);
    missing++;
    continue;
  }
  const to = join(target, engine.to);
  if (engine.dir) {
    copyFiltered(from, to, engine.skip ?? []);
  } else {
    mkdirSync(to, { recursive: true });
    for (const file of engine.files) {
      const src = join(from, file);
      if (!existsSync(src)) {
        console.warn(`[vendor] MISSING node_modules/${engine.from}/${file}`);
        missing++;
        continue;
      }
      cpSync(src, join(to, file), { dereference: true });
    }
  }
  ok++;
}
const mb = existsSync(target) ? sizeOf(target) / 1048576 : 0;
console.log(`[vendor] ${ok}/${ENGINES.length} engines, ${mb.toFixed(1)} MB in public/vendor`);
if (missing) {
  // Warn, never fail: `pnpm install` in the Dockerfile runs before the repo
  // is copied in, and a hard exit there would break the image build.
  console.warn(`[vendor] ${missing} asset(s) missing — run pnpm install, then: node scripts/copy-sandbox-vendor.mjs`);
}
