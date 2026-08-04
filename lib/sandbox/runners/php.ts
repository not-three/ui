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
