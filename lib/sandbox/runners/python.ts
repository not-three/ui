import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const PythonRunner: SandboxRunner = {
  id: "python-pyodide",
  label: "Python (Pyodide)",
  languages: ["python"],
  layout: "console",
  usesVendor: true,
  heavy: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.pyodide}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  console.info("Loading Python (Pyodide)…");
  try {
    var py = await loadPyodide({ indexURL: "${vendorBase}/${VENDOR_PATHS.pyodideIndex}" });
    py.setStdout({ batched: function (s) { console.log(s); } });
    py.setStderr({ batched: function (s) { console.error(s); } });
    // Loads wheels for imported packages from the local indexURL only.
    // Anything not vendored cannot be fetched (no external network), so say so.
    try {
      await py.loadPackagesFromImports(CODE);
    } catch (e) {
      console.warn(
        "Could not load an imported package offline. This sandbox ships the " +
        "Python standard library plus a small set of bundled packages; " +
        "others are unavailable. (" + String(e && e.message || e) + ")",
      );
    }
    var result = await py.runPythonAsync(CODE);
    if (result !== undefined) console.log(String(result));
  } catch (e) { console.error(String(e)); }
})();
</script>`,
  }),
};
