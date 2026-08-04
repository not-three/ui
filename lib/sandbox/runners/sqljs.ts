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
  tables: true,
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
    // --- table viewer -------------------------------------------------
    // Identifiers can never be bound as parameters in SQL, so every one is
    // first checked against the engine's own catalog and then double-quote
    // escaped. Search VALUES are always bound.
    function quoteIdent(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }
    function tableNames() {
      var res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      return res.length ? res[0].values.map(function (r) { return String(r[0]); }) : [];
    }
    window.__not3Tables__ = function () {
      return tableNames().map(function (name) {
        var cols = db.exec("PRAGMA table_info(" + quoteIdent(name) + ")");
        var count = db.exec("SELECT COUNT(*) FROM " + quoteIdent(name));
        return {
          name: name,
          columns: cols.length ? cols[0].values.map(function (r) { return String(r[1]); }) : [],
          rowCount: count.length ? Number(count[0].values[0][0]) : 0,
        };
      });
    };
    window.__not3Rows__ = function (q) {
      if (tableNames().indexOf(q.table) === -1) throw new Error("unknown table: " + q.table);
      var info = window.__not3Tables__().filter(function (t) { return t.name === q.table; })[0];
      var where = "";
      var params = [];
      if (q.search) {
        where = " WHERE " + info.columns.map(function (c) {
          return "CAST(" + quoteIdent(c) + " AS TEXT) LIKE ?";
        }).join(" OR ");
        for (var i = 0; i < info.columns.length; i++) params.push("%" + q.search + "%");
      }
      var order = "";
      if (q.sortBy && info.columns.indexOf(q.sortBy) !== -1) {
        order = " ORDER BY " + quoteIdent(q.sortBy) + (q.sortDir === "desc" ? " DESC" : " ASC");
      }
      var limit = Math.max(1, Math.min(200, Number(q.limit) || 50));
      var offset = Math.max(0, Number(q.offset) || 0);
      var total = db.exec("SELECT COUNT(*) FROM " + quoteIdent(q.table) + where, params);
      var rows = db.exec(
        "SELECT * FROM " + quoteIdent(q.table) + where + order + " LIMIT " + limit + " OFFSET " + offset,
        params,
      );
      return {
        rows: rows.length ? rows[0].values.map(function (r) { return r.map(String); }) : [],
        total: total.length ? Number(total[0].values[0][0]) : 0,
      };
    };
    printResults(db.exec(CODE));
  } catch (e) { console.error(String(e)); }
})();
</script>`,
  }),
};
