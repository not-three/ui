import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const TypescriptRunner: SandboxRunner = {
  id: "typescript",
  label: "TypeScript",
  languages: ["typescript"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.typescript}"></script>`,
    body: `<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    var js = ts.transpile(CODE, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None });
    (0, eval)(js);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
