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
  vue: "vue/vue.global.prod.js",
  vueSfcLoader: "vue/vue3-sfc-loader.js",
  svelteCompiler: "svelte/compiler/index.js",
  svelteIndexClient: "svelte/src/index-client.js",
  svelteInternalClient: "svelte/src/internal/client/index.js",
  svelteDiscloseVersion: "svelte/src/internal/disclose-version.js",
  svelteFlagsLegacy: "svelte/src/internal/flags/legacy.js",
  // php-wasm's build variants and a whole-package ruby.wasm+stdlib copy would
  // between them add ~230 MB; browser.script.iife.js was rejected (see
  // rubyScript below) because it hardcodes a jsdelivr.net CDN fetch.
  rubyScript: "ruby-wasm/browser.umd.js",
  rubyWasm: "ruby-wasm/ruby+stdlib.wasm",
  phpWeb: "php-wasm/PhpWeb.mjs",
  mermaid: "mermaid/mermaid.min.js",
  jscpp: "jscpp/JSCPP.es5.min.js",
  picoc: "picoc-js/bundle.js",
} as const;
