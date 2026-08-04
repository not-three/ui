import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

export const PgliteRunner: SandboxRunner = {
  id: "sql-pglite",
  label: "PostgreSQL (PGlite)",
  languages: ["sql"],
  layout: "console",
  usesVendor: true,
  heavy: true,
  replLanguage: "SQL",
  tables: true,
  build: ({ content, vendorBase }) => ({
    body: `<script type="module">
const CODE = ${embedJson(content)};
console.info("Loading PostgreSQL (PGlite)…");
function printResults(results) {
  for (const res of results) {
    if (!res.fields || !res.fields.length) {
      console.log("OK" + (res.affectedRows ? " (" + res.affectedRows + " rows)" : ""));
      continue;
    }
    console.log(res.fields.map((f) => f.name).join(" | "));
    for (const row of res.rows) {
      console.log(res.fields.map((f) => String(row[f.name])).join(" | "));
    }
  }
}
// Defined before the engine loads so REPL input during startup gets a clear
// answer instead of falling back to JS eval.
window.__not3Eval__ = function () { return "SQL engine is still loading…"; };
try {
  const { PGlite } = await import("${vendorBase}/${VENDOR_PATHS.pglite}");
  const db = new PGlite();
  // db stays alive after the run: the REPL (and the table viewer) query it.
  window.__not3Eval__ = async function (code) {
    printResults(await db.exec(code));
    return undefined;
  };
  // --- table viewer ---------------------------------------------------
  // Identifiers can never be bound as parameters in SQL, so every one is
  // first checked against the catalog (information_schema) and then
  // double-quote escaped. Search VALUES are always bound.
  function quoteIdent(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }
  async function tableNames() {
    const res = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    return res.rows.map((r) => String(r.table_name));
  }
  async function columnsOf(table) {
    const res = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
      [table],
    );
    return res.rows.map((r) => String(r.column_name));
  }
  window.__not3Tables__ = async function () {
    const names = await tableNames();
    const out = [];
    for (const name of names) {
      const columns = await columnsOf(name);
      const count = await db.query("SELECT COUNT(*) AS n FROM " + quoteIdent(name));
      out.push({ name: name, columns: columns, rowCount: Number(count.rows[0].n) });
    }
    return out;
  };
  window.__not3Rows__ = async function (q) {
    const names = await tableNames();
    if (names.indexOf(q.table) === -1) throw new Error("unknown table: " + q.table);
    const columns = await columnsOf(q.table);
    let where = "";
    const params = [];
    if (q.search) {
      const clauses = columns.map(function (c, i) {
        params.push("%" + q.search + "%");
        return quoteIdent(c) + "::text ILIKE $" + (i + 1);
      });
      where = " WHERE " + clauses.join(" OR ");
    }
    let order = "";
    if (q.sortBy && columns.indexOf(q.sortBy) !== -1) {
      order = " ORDER BY " + quoteIdent(q.sortBy) + (q.sortDir === "desc" ? " DESC" : " ASC");
    }
    const limit = Math.max(1, Math.min(200, Number(q.limit) || 50));
    const offset = Math.max(0, Number(q.offset) || 0);
    const total = await db.query(
      "SELECT COUNT(*) AS n FROM " + quoteIdent(q.table) + where,
      params,
    );
    const rows = await db.query(
      "SELECT * FROM " + quoteIdent(q.table) + where + order +
      " LIMIT " + limit + " OFFSET " + offset,
      params,
    );
    return {
      rows: rows.rows.map((row) => columns.map((c) => String(row[c]))),
      total: Number(total.rows[0].n),
    };
  };
  printResults(await db.exec(CODE));
} catch (e) { console.error(String(e && e.message || e)); }
</script>`,
  }),
};
