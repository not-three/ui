/**
 * URL paths of self-hosted interpreter assets, relative to `${origin}/vendor/`.
 * The files are NOT committed: scripts/copy-sandbox-vendor.mjs copies them
 * from node_modules on every install (postinstall). Privacy requirement:
 * runners must only ever load assets through these paths — never from a CDN.
 */
export const VENDOR_PATHS = {
  pyodide: "pyodide/pyodide.js",
  pyodideIndex: "pyodide/",
  wasmoon: "wasmoon/index.js",
  wasmoonGlue: "wasmoon/glue.wasm",
  sqlJs: "sql.js/sql-wasm.js",
  sqlJsDir: "sql.js/",
  pglite: "pglite/index.js",
  typescript: "typescript/typescript.js",
  coffeescript: "coffeescript/coffeescript.js",
  babel: "babel/babel.min.js",
  react: "react/react.production.min.js",
  reactDom: "react/react-dom.production.min.js",
  // Deliberately the DEV build: the prod build strips every runtime warning,
  // so a note with a broken template binding failed completely silently.
  vue: "vue/vue.global.js",
  vueSfcLoader: "vue/vue3-sfc-loader.js",
  svelteCompiler: "svelte/compiler/index.js",
  svelteIndexClient: "svelte/src/index-client.js",
  svelteInternalClient: "svelte/src/internal/client/index.js",
  svelteDiscloseVersion: "svelte/src/internal/disclose-version.js",
  svelteFlagsLegacy: "svelte/src/internal/flags/legacy.js",
  // Compiled Svelte components' "svelte/internal/client" module graph has
  // real (non-relative) `import ... from 'esm-env'` / `'clsx'` statements
  // (verified by walking the reachable import graph from src/index-client.js
  // and src/internal/client/index.js) -- these are svelte's own transitive
  // runtime deps, not vendored packages of ours, so they need their own
  // import-map entries alongside the svelte* ones above.
  svelteEsmEnv: "svelte/esm-env/index.js",
  svelteEsmEnvBrowser: "svelte/esm-env/browser-fallback.js",
  svelteEsmEnvDevelopment: "svelte/esm-env/dev-fallback.js",
  svelteEsmEnvNode: "svelte/esm-env/false.js",
  svelteClsx: "svelte/clsx/clsx.mjs",
  // php-wasm's build variants and a whole-package ruby.wasm+stdlib copy would
  // between them add ~230 MB; browser.script.iife.js was rejected (see
  // rubyScript below) because it hardcodes a jsdelivr.net CDN fetch.
  rubyScript: "ruby-wasm/browser.umd.js",
  rubyWasm: "ruby-wasm/ruby+stdlib.wasm",
  phpWeb: "php-wasm/PhpWeb.mjs",
  mermaid: "mermaid/mermaid.min.js",
  jscpp: "jscpp/JSCPP.es5.min.js",
  // dist/bundle.js is an ES module with top-level `import ... from 'path'`
  // (and 'fs', 'crypto', 'child_process') that a browser cannot resolve —
  // see lib/sandbox/runners/c.ts. dist/bundle.umd.js is the browser-usable
  // build; it attaches its API to `window.picocjs`.
  picoc: "picoc-js/bundle.umd.js",
} as const;
