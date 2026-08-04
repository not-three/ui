import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// picoc-js publishes dist/bundle.js as an ES module (package.json:
// "type": "module", "main": "dist/bundle.js") whose *literal* static
// imports are Node builtins — `import require$$0 from 'path'`, plus 'fs',
// 'crypto', 'child_process' — vestigial requires from its Emscripten
// Node.js fallback path, dead code behind `if (ENVIRONMENT_IS_NODE)` checks
// but still present as top-level `import` statements. Browsers resolve ES
// module imports eagerly before executing anything, so loading bundle.js
// as a <script type="module"> (or `await import(...)`) throws "Failed to
// resolve module specifier 'path'" immediately — verified by reading
// node_modules/picoc-js/dist/bundle.js directly.
//
// dist/bundle.umd.js has no such static imports (its UMD wrapper only
// calls require() behind a `typeof module !== 'undefined'` check that is
// false for a plain <script> tag) and attaches its API to
// `window.picocjs`, exactly like wasmoon's UMD-only bundle (see lua.ts) —
// loaded as a plain <script>, not an ES module.
//
// The documented API (node_modules/picoc-js/README.md) is
// `runC(cprog, consoleWrite)` — a single output callback, not the
// `{ output, error }` options object the original brief assumed. It is
// also fire-and-forget: runC() schedules execution on Emscripten's
// onRuntimeInitialized hook and returns immediately (not a promise), so a
// synchronous try/catch around the call cannot catch errors thrown once
// the program actually runs — those surface through the sandbox's global
// window.onerror bootstrap instead.
export const CRunner: SandboxRunner = {
  id: "c-picoc",
  label: "C (PicoC interpreter)",
  languages: ["c"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.picoc}"></script>`,
    body: `<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    picocjs.runC(CODE, function (line) { console.log(line); });
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
