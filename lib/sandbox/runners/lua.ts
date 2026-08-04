import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// wasmoon's dist/index.js is a UMD bundle (no `export` declarations) that,
// when it detects it isn't CommonJS/AMD, attaches its API to
// `globalThis.wasmoon`. Loading it as a plain <script> (like every other
// console runner here) and reading the global off `window` is what actually
// works: `await import(...)` on this exact file would silently resolve to a
// module namespace with no named bindings (no `export LuaFactory` exists in
// the source), so `const { LuaFactory } = await import(...)` yields
// `LuaFactory === undefined` and throws "not a constructor" at runtime —
// verified by reading public/vendor/wasmoon/index.js directly.
export const LuaRunner: SandboxRunner = {
  id: "lua-wasmoon",
  label: "Lua (wasmoon)",
  languages: ["lua"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.wasmoon}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  console.info("Loading Lua (wasmoon)…");
  try {
    var factory = new wasmoon.LuaFactory("${vendorBase}/${VENDOR_PATHS.wasmoonGlue}");
    var lua = await factory.createEngine();
    lua.global.set("print", function () {
      console.log(Array.prototype.slice.call(arguments).map(String).join("\\t"));
    });
    await lua.doString(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
