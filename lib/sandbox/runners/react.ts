import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { escapeScriptClose } from "./util";

// Appended to the user code INSIDE the same babel script so it shares its
// scope (top-level const/function in a script are not on window).
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
    body: `<div id="root"></div>
<script type="text/babel" data-presets="react">${escapeScriptClose(content + "\n" + AUTO_RENDER)}</script>`,
  }),
};
