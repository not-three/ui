import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const CppRunner: SandboxRunner = {
  id: "cpp-jscpp",
  label: "C++ (JSCPP interpreter)",
  languages: ["cpp"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => {
    // JSCPP has no namespace support at all: `std::cout` is a hard parse
    // error, while bare `cout` (as if `using namespace std;`) works. Stripping
    // the qualifier is semantically what JSCPP expects for the subset it
    // implements. Known tradeoff: a string literal containing "std::" is
    // mangled too — acceptable for a toy interpreter, and we say so below.
    const code = content.replace(/\bstd::/g, "");
    const stripped = code !== content;
    return {
      head: `<script src="${vendorBase}/${VENDOR_PATHS.jscpp}"></script>`,
      body: `<script>
(function () {
  var CODE = ${embedJson(code)};
  var STRIPPED = ${stripped};
  if (STRIPPED) console.info("note: std:: qualifiers were removed — the JSCPP interpreter has no namespace support");
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
    };
  },
};
