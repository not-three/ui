import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const ReactRunner: SandboxRunner = {
  id: "react",
  label: "React (Babel)",
  languages: ["jsx", "javascript"],
  layout: "preview",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head:
      `<script src="${vendorBase}/${VENDOR_PATHS.react}"></script>` +
      `<script src="${vendorBase}/${VENDOR_PATHS.reactDom}"></script>` +
      `<script src="${vendorBase}/${VENDOR_PATHS.babel}"></script>`,
    // The note is embedded as a JSON string literal (like every other
    // compiler runner), never spliced as raw source into the HTML. Relying on
    // Babel's own DOMContentLoaded scanner for type="text/babel" tags would
    // require the raw, un-escaped JSX source to live directly in the HTML
    // body, where a literal `<script>` element inside the JSX (perfectly
    // valid user code, e.g. `<div><script>...</script></div>`) or an
    // unbalanced `<!--<script>` would confuse the HTML tokenizer or an
    // escaping pass long before Babel ever saw it. Embedding as a JS string
    // and invoking Babel explicitly sidesteps HTML parsing entirely: the
    // browser only ever sees one well-formed <script> element.
    body: `<div id="root"></div>
<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    // The react preset alone leaves ES module syntax untouched, so a note
    // starting with "export default function App()" is a SyntaxError for
    // eval/new Function. The commonjs transform rewrites import/export into
    // require/exports, which the shims below satisfy.
    var compiled = Babel.transform(CODE, {
      presets: ["react"],
      plugins: ["transform-modules-commonjs"],
    }).code;
    var moduleShim = { exports: {} };
    var requireShim = function (name) {
      if (name === "react") return React;
      if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
      throw new Error("Cannot import \\"" + name + "\\": only react and react-dom exist in the sandbox");
    };
    // new Function gives the compiled CJS a private scope holding the shims;
    // the trailing return exposes a top-level \`function App() {}\` that never
    // went through exports (the pre-module-syntax style previously supported).
    var run = new Function(
      "require", "module", "exports",
      compiled + "\\n;return typeof App !== \\"undefined\\" ? App : undefined;",
    );
    var scopedApp = run(requireShim, moduleShim, moduleShim.exports);
    var App = moduleShim.exports.default || moduleShim.exports.App || scopedApp;
    var root = document.getElementById("root");
    if (root && !root.childNodes.length && App) {
      ReactDOM.createRoot(root).render(React.createElement(App));
    } else if (!App) {
      console.warn("No component found: export default one, or define function App() {}");
    }
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
