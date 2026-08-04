import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// Do not use `<script type="text/ruby">`. That mechanism lives in
// dist/browser.script.iife.js, which hardcodes and fetches
// https://cdn.jsdelivr.net the moment it loads — a flat violation of the
// zero-external-request mandate (confirmed by grepping the package; it is
// deliberately NOT vendored). dist/browser.umd.js is the side-effect-free
// build instead: it defines window["ruby-wasm-wasi"].DefaultRubyVM with no
// CDN reference, and the VM is booted explicitly below.
export const RubyRunner: SandboxRunner = {
  id: "ruby-wasm",
  label: "Ruby (ruby.wasm)",
  languages: ["ruby"],
  layout: "console",
  usesVendor: true,
  heavy: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.rubyScript}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  console.info("Loading Ruby (ruby.wasm)…");
  try {
    // arrayBuffer + compile (not compileStreaming): independent of the
    // Content-Type the host serves .wasm with.
    var response = await fetch("${vendorBase}/${VENDOR_PATHS.rubyWasm}");
    if (!response.ok) throw new Error("failed to load ruby.wasm: " + response.status);
    var module = await WebAssembly.compile(await response.arrayBuffer());
    // consolePrint defaults to true: puts/warn land in console.*, which the
    // sandbox bootstrap relays to the panel.
    var booted = await window["ruby-wasm-wasi"].DefaultRubyVM(module);
    booted.vm.eval(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
