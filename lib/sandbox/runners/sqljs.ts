import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const SqlJsRunner: SandboxRunner = {
  id: "sql-sqljs",
  label: "SQLite (sql.js)",
  languages: ["sql"],
  layout: "console",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.sqlJs}"></script>`,
    body: `<script>
(async function () {
  var CODE = ${embedJson(content)};
  try {
    var SQL = await initSqlJs({ locateFile: function (f) { return "${vendorBase}/${VENDOR_PATHS.sqlJsDir}" + f; } });
    var db = new SQL.Database();
    var results = db.exec(CODE);
    if (!results.length) console.log("OK (no rows returned)");
    results.forEach(function (res) {
      console.log(res.columns.join(" | "));
      res.values.forEach(function (row) { console.log(row.map(String).join(" | ")); });
    });
  } catch (e) { console.error(String(e)); }
})();
</script>`,
  }),
};
