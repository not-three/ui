import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// CORRECTION vs. the original brief: the brief's Step 2 loaded the compiler
// via `await import(".../svelte/compiler/index.js")` and destructured
// `{ compile }` from it, assuming a genuine ESM export. That assumption is
// wrong for the vendored file specifically. svelte's package.json exports
// map for "./compiler" is `{ "require": "./compiler/index.js", "default":
// "./src/compiler/index.js" }` -- so `compiler/index.js` is the CommonJS/
// "require" build, and the real ESM entry point importers get is
// `src/compiler/index.js` (1.7 MB of compiler *source*, deliberately not
// vendored -- see scripts/copy-sandbox-vendor.mjs). Reading the vendored
// compiler/index.js confirms it: a UMD wrapper
// (`!function(e,t){...t((...).svelte={})}(this,(function(e){...`) with zero
// top-level `export` statements (the one textual "export" match is inside a
// string literal the compiler emits as *generated code*, not a real export).
// `await import()` on a script with no export statements resolves to a
// module namespace with no bindings, so `const { compile } = await
// import(...)` would silently give `compile === undefined` and throw
// "compile is not a function" on every run. Loading it as a classic
// <script src> in <head> (which blocks parsing) makes the UMD global
// `svelte.compile` available before the body's module script runs -- same
// fix as lua.ts/wasmoon and c.ts/picoc-js.
//
// Separately, walking the real (non-JSDoc) import graph reachable from
// src/index-client.js and src/internal/client/index.js turned up two more
// bare specifiers the brief's import map didn't cover: `esm-env` (imported
// by most of internal/client/*, transitively reachable from the
// "svelte/internal/client" module) and `clsx` (imported by
// internal/shared/attributes.js, re-exported through internal/client/
// index.js). Both are svelte's own transitive runtime deps, not vendored
// packages of ours; scripts/copy-sandbox-vendor.mjs now copies their tiny
// self-contained ESM entry files (verified no further bare imports) and
// VENDOR_PATHS/the import map below resolve them the same way as the
// svelte/* specifiers.
export const SvelteRunner: SandboxRunner = {
  id: "svelte",
  label: "Svelte",
  languages: ["svelte"],
  layout: "preview",
  usesVendor: true,
  scriptBlob: true,
  heavy: true,
  build: ({ content, vendorBase }) => {
    const importMap = embedJson({
      imports: {
        "svelte": `${vendorBase}/${VENDOR_PATHS.svelteIndexClient}`,
        "svelte/internal/client": `${vendorBase}/${VENDOR_PATHS.svelteInternalClient}`,
        "svelte/internal/disclose-version": `${vendorBase}/${VENDOR_PATHS.svelteDiscloseVersion}`,
        "svelte/internal/flags/legacy": `${vendorBase}/${VENDOR_PATHS.svelteFlagsLegacy}`,
        "esm-env": `${vendorBase}/${VENDOR_PATHS.svelteEsmEnv}`,
        "esm-env/browser": `${vendorBase}/${VENDOR_PATHS.svelteEsmEnvBrowser}`,
        "esm-env/development": `${vendorBase}/${VENDOR_PATHS.svelteEsmEnvDevelopment}`,
        "esm-env/node": `${vendorBase}/${VENDOR_PATHS.svelteEsmEnvNode}`,
        "clsx": `${vendorBase}/${VENDOR_PATHS.svelteClsx}`,
      },
    });
    return {
      head:
        `<script type="importmap">${importMap}</script>` +
        `<script src="${vendorBase}/${VENDOR_PATHS.svelteCompiler}"></script>`,
      body: `<div id="app"></div>
<script type="module">
const CODE = ${embedJson(content)};
console.info("Compiling Svelte…");
try {
  const compiled = svelte.compile(CODE, { generate: "client" });
  const blob = new Blob([compiled.js.code], { type: "text/javascript" });
  const mod = await import(URL.createObjectURL(blob));
  const { mount } = await import("svelte");
  mount(mod.default, { target: document.getElementById("app") });
  if (compiled.css && compiled.css.code) {
    const style = document.createElement("style");
    style.textContent = compiled.css.code;
    document.head.appendChild(style);
  }
} catch (e) { console.error(String(e && e.stack || e)); }
</script>`,
    };
  },
};
