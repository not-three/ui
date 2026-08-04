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
  replLanguage: "Python",
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.pyodide}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  console.info("Loading Python (Pyodide)…");
  // Defined before the interpreter loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "Python is still loading…"; };
  try {
    var py = await loadPyodide({ indexURL: "${vendorBase}/${VENDOR_PATHS.pyodideIndex}" });
    py.setStdout({ batched: function (s) { console.log(s); } });
    py.setStderr({ batched: function (s) { console.error(s); } });
    // The interpreter stays alive after the run, so the REPL shares the
    // note's globals. print(...) output already reaches the console above.
    window.__not3Eval__ = async function (code) {
      var replResult = await py.runPythonAsync(code);
      return replResult === undefined ? undefined : String(replResult);
    };
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
