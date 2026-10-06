// Copies self-hosted sandbox interpreter assets from node_modules into
// public/vendor/. public/vendor is gitignored: it is derived output,
// regenerated on every install so nothing is hardcoded into the repo and
// the app never contacts a CDN at runtime (privacy requirement).
//
// Copies are SELECTIVE: only the files a runner actually loads. Blanket
// package copies would add ~300 MB to the image (php-wasm alone is 182 MB
// unpacked); tests/lib/sandbox/vendor.test.ts enforces the budgets.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build, buildSync } from "esbuild";
import { replaceCdnUrls } from "./vendor-cdn.mjs";
import { PART_LIMIT, splitLargeFiles } from "./vendor-split.mjs";
import { createHash } from "node:crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modules = join(root, "node_modules");
const target = join(root, "public", "vendor");
const imageLedger = join(target, "image", "LICENSES.md");
const preservedImageLedger = existsSync(imageLedger) ? readFileSync(imageLedger) : null;

const IMAGE_CODECS = [
  { name: "avif", wasm: ["codec/enc/avif_enc.wasm", "codec/dec/avif_dec.wasm"] },
  { name: "jxl", wasm: ["codec/enc/jxl_enc.wasm", "codec/dec/jxl_dec.wasm"] },
  { name: "webp", wasm: ["codec/enc/webp_enc.wasm", "codec/dec/webp_dec.wasm"] },
  { name: "png", wasm: ["codec/pkg/squoosh_png_bg.wasm"] },
  { name: "jpeg", wasm: ["codec/enc/mozjpeg_enc.wasm", "codec/dec/mozjpeg_dec.wasm"] },
];

async function copyImageCodecs() {
  for (const { name, wasm } of IMAGE_CODECS) {
    const packageDir = join(modules, "@jsquash", name);
    if (!existsSync(packageDir)) { console.warn(`[vendor] MISSING @jsquash/${name}`); continue; }
    const destination = join(target, "image", name);
    mkdirSync(destination, { recursive: true });
    await build({
      entryPoints: [join(packageDir, "index.js")],
      bundle: true,
      format: "esm",
      platform: "browser",
      target: "es2022",
      plugins: [{
        name: "single-thread-codecs",
        setup(build) {
          build.onResolve({ filter: /^wasm-feature-detect$/ }, () => ({ path: "wasm-feature-detect", namespace: "single-thread-codecs" }));
          build.onLoad({ filter: /.*/, namespace: "single-thread-codecs" }, () => ({ contents: "export const threads = async () => false; export const simd = async () => false;", loader: "js" }));
        },
      }],
      outfile: join(destination, "codec.mjs"),
    });
    for (const file of wasm) cpSync(join(packageDir, file), join(destination, file.split("/").at(-1)), { dereference: true });
    cpSync(join(packageDir, "LICENSE"), join(destination, "LICENSE"), { dereference: true });
    const codecNotice = join(packageDir, "codec", "LICENSE.codec.md");
    if (existsSync(codecNotice)) cpSync(codecNotice, join(destination, "LICENSE.codec.md"), { dereference: true });
    console.log(`[vendor] image/${name}: ${(sizeOf(destination) / 1048576).toFixed(2)} MB`);
  }
  const heifSource = join(modules, "libheif-js", "libheif-wasm", "libheif-bundle.mjs");
  if (existsSync(heifSource)) {
    const destination = join(target, "image", "heic");
    mkdirSync(destination, { recursive: true });
    cpSync(heifSource, join(destination, "libheif-bundle.mjs"), { dereference: true });
    cpSync(join(modules, "libheif-js", "LICENSE"), join(destination, "LICENSE"), { dereference: true });
    console.log(`[vendor] image/heic: ${(sizeOf(destination) / 1048576).toFixed(2)} MB`);
  } else console.warn("[vendor] MISSING libheif-js wasm bundle");
}

// esm-env and clsx are transitive runtime dependencies of svelte's compiled
// "svelte/internal/client" module graph (bare `import ... from 'esm-env'` /
// `'clsx'`), not direct dependencies of this project, so pnpm does not hoist
// them to a stable node_modules/<name> path -- they only exist nested inside
// svelte's own resolved location (node_modules/.pnpm/svelte@<version>/
// node_modules/<pkg>). Resolve them via svelte's own symlink rather than a
// version-pinned .pnpm/<pkg>@<version> path, so a future svelte (or esm-env/
// clsx) version bump doesn't silently stop resolving.
function svelteDepDir(pkg) {
  const svelteDir = join(modules, "svelte");
  if (!existsSync(svelteDir)) return join(modules, pkg);
  return join(dirname(realpathSync(svelteDir)), pkg);
}

const JUNK = /\.(map|d\.ts|md|txt)$/i;

// Known CDN hosts that have turned up hardcoded inside vendored packages as
// *default* fetch targets — not just documentation. Two confirmed instances:
// wasmoon's LuaFactory falls back to `https://unpkg.com/wasmoon@<version>/
// dist/glue.wasm` when no explicit wasm URI is given (the zero-arg
// `new LuaFactory()` call from wasmoon's own docs), and pyodide's
// loadPyodide() unconditionally calls `setCdnUrl('https://cdn.jsdelivr.net/
// pyodide/v<version>/full/')` as the base for fetching any non-stdlib Python
// package. cdnjs.cloudflare.com and esm.sh are included preemptively — same
// class of package, not yet confirmed present, but cheap to neutralise up
// front rather than wait for the next dependency bump to reintroduce one.
//
// The sandbox iframe's CSP (connect-src limited to the app origin, widened
// to `https:` only when the user ticks the network checkbox) already blocks
// these hosts at the network layer, so nothing could leak with the checkbox
// off. But the user's mandate is stronger than "blocked at runtime": no CDN
// URL may ship in the bundle at all, because the user CAN tick that
// checkbox for their own code's use, and a residual CDN string is a latent
// exfiltration path the CSP would then no longer stop for THIS asset. So the
// strings are removed at the source, not merely left for the CSP to block.
//
// vendored.invalid uses the RFC 2606 reserved .invalid TLD, which can never
// resolve in DNS — any code path that still tries to fetch it fails loudly
// (offline) instead of silently reaching a real host.
const CDN_HOSTS = ["cdn.jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com", "esm.sh"];
const SANITIZE_EXT = /\.(m?js|cjs|json)$/i;

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
      "pyodide.asm.mjs",
      "pyodide.asm.wasm",
      "python_stdlib.zip",
      "pyodide-lock.json",
    ],
  },
  { from: "wasmoon/dist", to: "wasmoon", dir: true },
  { from: "sql.js/dist", to: "sql.js", files: ["sql-wasm.js", "sql-wasm.wasm"] },
  { from: "papaparse", to: "papaparse", files: ["papaparse.min.js"] },
  // pglite/dist also ships ~150 optional Postgres extension .tar.gz files and
  // contrib/fs/live/vector/worker/ subtrees (extra build variants). Only the
  // core engine that `new PGlite()` loads is copied: the ESM entry, its seven
  // chunk-*.js dependencies (verified via static import graph), and the
  // Postgres + initdb wasm binaries and preload data it fetches by relative
  // URL.
  {
    from: "@electric-sql/pglite/dist",
    to: "pglite",
    files: [
      "index.js",
      "chunk-2BOC2OMW.js",
      "chunk-DDJLRBDX.js",
      "chunk-F4GETNPB.js",
      "chunk-JDT7TZ73.js",
      "chunk-NNS5RQRF.js",
      "chunk-QY3QWFKW.js",
      "chunk-RYDTTX3G.js",
      "pglite.wasm",
      "pglite.data",
      "initdb.wasm",
    ],
  },
  { from: "typescript/lib", to: "typescript", files: ["typescript.js"] },
  {
    from: "coffeescript/lib/coffeescript-browser-compiler-legacy",
    to: "coffeescript",
    files: ["coffeescript.js"],
  },
  { from: "@babel/standalone", to: "babel", files: ["babel.min.js"] },
  // The sandbox deliberately ships the DEV build of Vue: the prod build strips
  // ALL runtime warnings, so a note whose template references a nonexistent
  // method rendered a dead button with an empty console. Warnings are the
  // feature here, and the ~0.6 MB extra is inside the vue size budget.
  { from: "vue/dist", to: "vue", files: ["vue.global.js"] },
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
  // esm-env's index.js re-exports its ./browser, ./development and ./node
  // subpaths; browsers apply only the "default" export condition (no
  // "browser"/"development"/"production"/"node" custom conditions), which
  // resolves those subpaths to browser-fallback.js, dev-fallback.js and
  // false.js respectively -- true.js is never reached under that condition,
  // so it is skipped.
  {
    from: relative(modules, svelteDepDir("esm-env")),
    to: "svelte/esm-env",
    files: ["index.js", "browser-fallback.js", "dev-fallback.js", "false.js"],
  },
  // clsx's ESM entry (package.json exports "." -> import -> dist/clsx.mjs)
  // is a single self-contained file with no further imports.
  {
    from: relative(modules, join(svelteDepDir("clsx"), "dist")),
    to: "svelte/clsx",
    files: ["clsx.mjs"],
  },
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
  // — plus the small ESM wrapper modules PhpWeb.mjs transitively imports
  // (verified via their import graphs) and the one wasm binary that build
  // loads by relative URL. The runner imports PhpWeb.mjs directly rather
  // than php-tags.mjs's <script type="text/php"> tag-scanning wrapper (see
  // lib/sandbox/runners/php.ts for why), so php-tags.mjs itself is not
  // copied — it isn't loaded by anything.
  {
    from: "php-wasm",
    to: "php-wasm",
    files: [
      "PhpWeb.mjs",
      "PhpWebBase.mjs",
      "PhpBase.mjs",
      "webTransactions.mjs",
      "OutputBuffer.mjs",
      "_Event.mjs",
      "fsOps.mjs",
      "resolveDependencies.mjs",
      "php8.4-web.mjs",
      "6733ae879e026f8b36961884052b87de4def4e15.wasm",
    ],
  },
  { from: "mermaid/dist", to: "mermaid", files: ["mermaid.min.js"] },
  { from: "jscpp/dist", to: "jscpp", files: ["JSCPP.es5.min.js"] },
  // dist/bundle.js is an ES module with top-level `import ... from 'path'`
  // (Node builtin) that a browser cannot resolve; dist/bundle.umd.js is
  // the browser-usable UMD build the runner actually loads (see
  // lib/sandbox/runners/c.ts).
  { from: "picoc-js/dist", to: "picoc-js", files: ["bundle.umd.js"] },
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

/**
 * Walks every copied text file under `dir` and rewrites the origin of any
 * known CDN URL to the non-resolving `vendored.invalid`, keeping the path
 * so surrounding string handling (concatenation, template literals) is
 * unaffected. Never touches anything outside `dir`. Rewrites indiscriminately
 * — including matches inside comments/license headers — because reliably
 * telling those apart from live code isn't worth the risk of missing one.
 * Returns the number of files it changed.
 */
function sanitizeCdnReferences(dir) {
  let filesChanged = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      filesChanged += sanitizeCdnReferences(full);
      continue;
    }
    if (!SANITIZE_EXT.test(entry.name)) continue;
    const original = readFileSync(full, "utf8");
    const { text, count } = replaceCdnUrls(original, CDN_HOSTS, "https://vendored.invalid");
    if (count === 0) continue;
    if (full === join(target, "image", "heic", "libheif-bundle.mjs")) throw new Error("libheif-js bundle must remain unmodified; choose a source without CDN references");
    writeFileSync(full, text);
    console.log(`[vendor] neutralised ${count} CDN reference(s) in ${relative(root, full)}`);
    filesChanged++;
  }
  return filesChanged;
}

rmSync(target, { recursive: true, force: true });
if (preservedImageLedger) {
  mkdirSync(dirname(imageLedger), { recursive: true });
  writeFileSync(imageLedger, preservedImageLedger);
}
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
// The runtime is loaded from here at run time, never through the bundler
// (lib/image/ort-loader.ts): the WebGPU bundle needs the asyncify binary,
// the plain bundle the smaller wasm-only one.
const ortFiles = [
  "ort.webgpu.min.mjs", "ort-wasm-simd-threaded.asyncify.mjs", "ort-wasm-simd-threaded.asyncify.wasm",
  "ort.wasm.min.mjs", "ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm",
];
const ortSource = join(modules, "onnxruntime-web", "dist");
if (existsSync(ortSource)) {
  const ortTarget = join(target, "image", "onnxruntime-web");
  mkdirSync(ortTarget, { recursive: true });
  for (const file of ortFiles) cpSync(join(ortSource, file), join(ortTarget, file));
  console.log(`[vendor] onnxruntime-web ${((sizeOf(ortTarget)) / 1048576).toFixed(1)} MB`);
} else console.warn("[vendor] MISSING onnxruntime-web runtime assets");

const modelSource = "https://huggingface.co/Ko033/isnet-general-use-onnx/resolve/5349b617911fd60c619b52f32e2b593517b78df3/onnx/model_quantized.onnx";
const modelSha256 = "5039225b9a4ac3df55f185d24b7a92d640c86cc4747002d7f23351e394de03a6";
const modelCache = join(modules, ".cache", "not3-image", "model_quantized.onnx");
const modelTarget = join(target, "image", "isnet-general-use", "model_quantized.onnx");
async function copyModel() {
  if (!existsSync(modelCache)) {
    const response = await fetch(modelSource);
    if (!response.ok) throw new Error(`Background model download failed: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    mkdirSync(dirname(modelCache), { recursive: true });
    writeFileSync(modelCache, bytes);
  }
  const bytes = readFileSync(modelCache);
  if (bytes.length !== 45_902_969 || createHash("sha256").update(bytes).digest("hex") !== modelSha256) {
    rmSync(modelCache, { force: true });
    throw new Error("Background model checksum or size mismatch");
  }
  mkdirSync(dirname(modelTarget), { recursive: true });
  cpSync(modelCache, modelTarget);
  console.log(`[vendor] isnet-general-use model ${(sizeOf(modelTarget) / 1048576).toFixed(1)} MB`);
}
if (existsSync(ortSource)) await copyModel();
// One browser bundle keeps the parser, task-list plugin and common syntax
// highlighter self-hosted while avoiding Node-style require() in the iframe.
const markdownDir = join(target, "markdown");
mkdirSync(markdownDir, { recursive: true });
buildSync({
  stdin: {
    contents: `import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import hljs from "highlight.js/lib/common";
window.__not3Markdown = { MarkdownIt, taskLists, hljs };`,
    resolveDir: root,
    sourcefile: "sandbox-markdown-entry.js",
  },
  bundle: true,
  minify: true,
  platform: "browser",
  format: "iife",
  outfile: join(markdownDir, "markdown.min.js"),
});
// React 19 no longer publishes UMD builds, so react, react-dom and
// react-dom/client are bundled into one production IIFE that provides the
// React and ReactDOM globals the React runner expects.
const reactDir = join(target, "react");
mkdirSync(reactDir, { recursive: true });
buildSync({
  stdin: {
    contents: `import * as React from "react";
import * as ReactDOMBase from "react-dom";
import * as ReactDOMClient from "react-dom/client";
window.React = React;
window.ReactDOM = { ...ReactDOMBase, ...ReactDOMClient };`,
    resolveDir: root,
    sourcefile: "sandbox-react-entry.js",
  },
  bundle: true,
  minify: true,
  platform: "browser",
  format: "iife",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: join(reactDir, "react.min.js"),
});
const markdownMb = sizeOf(markdownDir) / 1048576;
if (markdownMb >= 2) throw new Error(`markdown vendor bundle exceeds 2 MB: ${markdownMb.toFixed(2)} MB`);
await copyImageCodecs();
const filesSanitized = existsSync(target) ? sanitizeCdnReferences(target) : 0;
// Last: cut every file above the hosting platform's per-file limit into parts
// (see vendor-split.mjs); the browser reassembles them from the manifest.
const splitManifests = existsSync(target) ? splitLargeFiles(target, PART_LIMIT) : [];
for (const manifest of splitManifests) {
  console.log(`[vendor] split ${relative(root, manifest.path)} into ${manifest.parts.length} parts (${(manifest.size / 1048576).toFixed(1)} MB)`);
}
const mb = existsSync(target) ? sizeOf(target) / 1048576 : 0;
console.log(`[vendor] ${ok}/${ENGINES.length} engines, ${mb.toFixed(1)} MB in public/vendor`);
if (filesSanitized) {
  console.log(`[vendor] neutralised CDN references in ${filesSanitized} file(s)`);
}
if (missing) {
  // Warn, never fail: `pnpm install` in the Dockerfile runs before the repo
  // is copied in, and a hard exit there would break the image build.
  console.warn(`[vendor] ${missing} asset(s) missing — run pnpm install, then: node scripts/copy-sandbox-vendor.mjs`);
}
