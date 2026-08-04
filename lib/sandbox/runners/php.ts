import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// The brief's <script type="text/php"> approach turned out not to render
// anything: php-tags.mjs's runPhpScriptTag() only writes stdout/stderr into
// the DOM when the tag carries a data-stdout / data-stderr attribute
// pointing at a target element (verified by reading
// node_modules/php-wasm/php-tags.mjs) — otherwise the output is buffered
// into a closure-local variable and discarded. A plain <script
// type="text/php"> tag with no data attributes would therefore silently
// show nothing in the preview pane.
//
// This runner instead imports the PhpWeb class directly — the same
// documented entrypoint php-tags.mjs itself wraps (README.md: "import {
// PhpWeb } from 'php-wasm/PhpWeb'; const php = new PhpWeb(); await
// php.run(code);") — and wires its "output"/"error" events explicitly:
// stdout is written into the preview body as HTML (matching how a real PHP
// page renders echo/print), stderr is routed through console.error so it
// surfaces via the sandbox's console bootstrap. PhpBase's OutputBuffer
// dispatches these events with `detail` as a one-element array (see
// node_modules/php-wasm/OutputBuffer.mjs / _Event.mjs), hence `detail[0]`.
export const PhpRunner: SandboxRunner = {
  id: "php-wasm",
  label: "PHP (php-wasm)",
  languages: ["php"],
  layout: "preview",
  usesVendor: true,
  heavy: true,
  build: ({ content, vendorBase }) => ({
    body: `<div id="php-out"></div>
<script type="module">
// The Web Locks API rejects in opaque-origin contexts, and this iframe is
// deliberately opaque (that is the whole sandbox model). php-wasm's
// _enqueue() serializes every operation through navigator.locks.request, so
// without a shim the very first run dies as an unhandled rejection. One
// iframe == one tab == one queue, so a promise chain is a faithful
// replacement. defineProperty shadows the Navigator.prototype getter with an
// own property.
(function () {
  var chain = Promise.resolve();
  var locksShim = {
    request: function (name, optionsOrCallback, maybeCallback) {
      var callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
      var next = chain.then(function () {
        return callback({ name: String(name), mode: "exclusive" });
      });
      chain = next.catch(function () {});
      return next;
    },
    query: function () { return Promise.resolve({ held: [], pending: [] }); },
  };
  try {
    Object.defineProperty(navigator, "locks", { value: locksShim, configurable: true });
  } catch (e) { /* real locks stay; fine on non-opaque origins */ }
})();
const CODE = ${embedJson(content)};
try {
  const { PhpWeb } = await import("${vendorBase}/${VENDOR_PATHS.phpWeb}");
  const php = new PhpWeb();
  const out = document.getElementById("php-out");
  let stdout = "";
  php.addEventListener("output", function (e) { stdout += e.detail[0]; out.innerHTML = stdout; });
  php.addEventListener("error", function (e) { console.error(e.detail[0]); });
  const exitCode = await php.run(CODE);
  if (exitCode) console.warn("PHP exited with code: " + exitCode);
} catch (e) { console.error(String(e && e.message || e)); }
</script>`,
  }),
};
