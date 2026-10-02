import { expect, test } from "@playwright/test";
import { evalInSandbox, expectConsole, requestRows, requestTables, runNote } from "./helpers";

const NOTE = "CREATE TABLE t(a INT); INSERT INTO t VALUES (42); SELECT * FROM t;";

test("pglite executes, browses tables and answers the REPL in SQL", async ({ page }) => {
  await runNote(page, "sql-pglite", NOTE);
  await expectConsole(page, "log", "42");

  const tables = await requestTables(page);
  expect(tables).toContainEqual(
    expect.objectContaining({ name: "t", columns: ["a"], rowCount: 1 }),
  );

  const rows = await requestRows(page, { id: 1, table: "t", offset: 0, limit: 50 });
  expect(rows.rows).toEqual([["42"]]);
  expect(rows.total).toBe(1);

  await evalInSandbox(page, "SELECT 43 AS answer");
  await expectConsole(page, "log", "43");
});
