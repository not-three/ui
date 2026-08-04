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
  build: ({ content, vendorBase }) => ({
    body: `<script type="module">
const CODE = ${embedJson(content)};
console.info("Loading PostgreSQL (PGlite)…");
try {
  const { PGlite } = await import("${vendorBase}/${VENDOR_PATHS.pglite}");
  const db = new PGlite();
  const results = await db.exec(CODE);
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
} catch (e) { console.error(String(e && e.message || e)); }
</script>`,
  }),
};
