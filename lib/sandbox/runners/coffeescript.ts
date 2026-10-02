import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const CoffeescriptRunner: SandboxRunner = {
  id: "coffeescript",
  label: "CoffeeScript",
  languages: ["coffeescript"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.coffeescript}"></script>`,
    body: `<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    (0, eval)(CoffeeScript.compile(CODE, { bare: true }));
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
</script>`,
  }),
};
