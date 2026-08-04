import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const SqlJsRunner: SandboxRunner = {
  id: "sql-sqljs",
  label: "SQLite (sql.js)",
  languages: ["sql"],
  layout: "console",
  usesVendor: true,
  replLanguage: "SQL",
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.sqlJs}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  function printResults(results) {
    if (!results.length) { console.log("OK (no rows returned)"); return; }
    results.forEach(function (res) {
      console.log(res.columns.join(" | "));
      res.values.forEach(function (row) { console.log(row.map(String).join(" | ")); });
    });
  }
  // Defined before the engine loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "SQL engine is still loading…"; };
  try {
    var SQL = await initSqlJs({ locateFile: function (f) { return "${vendorBase}/${VENDOR_PATHS.sqlJsDir}" + f; } });
    var db = new SQL.Database();
    // db stays alive after the run: the REPL (and the table viewer) query it.
    window.__not3Eval__ = function (code) {
      printResults(db.exec(code));
      return undefined;
    };
    printResults(db.exec(CODE));
  } catch (e) { console.error(String(e)); }
})();
</script>`,
  }),
};
