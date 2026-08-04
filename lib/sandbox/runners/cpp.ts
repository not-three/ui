import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const CppRunner: SandboxRunner = {
  id: "cpp-jscpp",
  label: "C++ (JSCPP interpreter)",
  languages: ["cpp"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.jscpp}"></script>`,
    body: `<script>
(function () {
  var CODE = ${embedJson(content)};
  try {
    var buffered = "";
    var exit = JSCPP.run(CODE, "", { stdio: { write: function (s) {
      buffered += s;
      var lines = buffered.split("\\n");
      buffered = lines.pop();
      lines.forEach(function (l) { console.log(l); });
    } } });
    if (buffered) console.log(buffered);
    console.info("exit code: " + exit);
  } catch (e) { console.error(String(e && e.message || e)); }
})();
</script>`,
  }),
};
