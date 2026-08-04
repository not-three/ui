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
  printResults(await db.exec(CODE));
} catch (e) { console.error(String(e && e.message || e)); }
</script>`,
  }),
};
