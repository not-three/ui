import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

// Appended to the compiled user code INSIDE the same eval() call (concatenated
// into one string, not a second <script>), so it shares scope with the user's
// top-level `function App() {}` declaration regardless of eval strictness.
const AUTO_RENDER = `
;(function () {
  try {
    var __root = document.getElementById("root");
    if (__root && !__root.childNodes.length && typeof App !== "undefined") {
      ReactDOM.createRoot(__root).render(React.createElement(App));
    }
  } catch (e) { console.error(String(e)); }
})();`;

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
  var EPILOGUE = ${embedJson(AUTO_RENDER)};
  try {
    var compiled = Babel.transform(CODE, { presets: ["react"] }).code;
    (0, eval)(compiled + EPILOGUE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
