import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { runnersForLanguage } from "~/lib/sandbox/runners";
import { SqlJsRunner } from "~/lib/sandbox/runners/sqljs";
import { PgliteRunner } from "~/lib/sandbox/runners/pglite";

const ORIGIN = "https://app.example";
const OPTS = { token: "tok", allowNetwork: false, origin: ORIGIN };

describe("sql runners", () => {
  it("offers two engines for sql, sql.js first", () => {
    expect(runnersForLanguage("sql").map((r) => r.id)).toEqual(["sql-sqljs", "sql-pglite"]);
  });

  it("sql.js locates its wasm under the app origin", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: SqlJsRunner, content: "SELECT 1;" });
    expect(doc).toContain(`${ORIGIN}/vendor/sql.js/sql-wasm.js`);
    expect(doc).toContain(`"${ORIGIN}/vendor/sql.js/" + f`);
  });

  it("pglite imports the self-hosted ESM bundle and is heavy", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: PgliteRunner, content: "SELECT 1;" });
    expect(doc).toContain(`${ORIGIN}/vendor/pglite/index.js`);
    expect(PgliteRunner.heavy).toBe(true);
  });

  it("both engines expose the table viewer hooks", () => {
    for (const runner of [SqlJsRunner, PgliteRunner]) {
      expect(runner.tables).toBe(true);
      const doc = buildSrcdoc({ ...OPTS, runner, content: "SELECT 1;" });
      expect(doc).toContain("__not3Tables__");
      expect(doc).toContain("__not3Rows__");
      // Identifiers are validated against the live catalog and quoted; the
      // search term must be a bound parameter, never concatenated.
      expect(doc).toContain("quoteIdent");
      expect(doc).toContain("unknown table");
    }
  });

  it("both engines declare a SQL repl and install the eval hook", () => {
    for (const runner of [SqlJsRunner, PgliteRunner]) {
      expect(runner.replLanguage).toBe("SQL");
      const doc = buildSrcdoc({ ...OPTS, runner, content: "SELECT 1;" });
      expect(doc).toContain("__not3Eval__");
    }
  });
});
