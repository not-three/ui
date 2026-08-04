import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// vue.global.prod.js assigns a plain global `var Vue = ...` (not ESM: zero
// `export` statements) and vue3-sfc-loader.js is a UMD bundle whose factory
// wrapper (`!function(e,t){...e["vue3-sfc-loader"]=t()}(self,...)`) attaches
// its API to `window["vue3-sfc-loader"]` when neither CommonJS nor AMD is
// detected -- verified by reading both vendored files directly. Loading them
// as plain <script src> tags in <head> (which block parsing) and reading the
// globals off `window` in the body script is what actually works; `await
// import()` on either file would resolve to a module namespace with no
// bindings and silently yield `undefined`.
export const VueRunner: SandboxRunner = {
  id: "vue-sfc",
  label: "Vue SFC",
  languages: ["vue"],
  layout: "preview",
  usesVendor: true,
  heavy: true,
  build: ({ content, vendorBase }) => ({
    head:
      `<script src="${vendorBase}/${VENDOR_PATHS.vue}"></script>` +
      `<script src="${vendorBase}/${VENDOR_PATHS.vueSfcLoader}"></script>`,
    body: `<div id="app"></div>
<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    var options = {
      moduleCache: { vue: Vue },
      getFile: function () { return Promise.resolve(CODE); },
      addStyle: function (css) {
        var s = document.createElement("style");
        s.textContent = css;
        document.head.appendChild(s);
      },
      log: function (type) {
        (console[type] || console.log).apply(console, [].slice.call(arguments, 1));
      },
    };
    var loadModule = window["vue3-sfc-loader"].loadModule;
    Vue.createApp(
      Vue.defineAsyncComponent(function () { return loadModule("note.vue", options); }),
    ).mount("#app");
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
