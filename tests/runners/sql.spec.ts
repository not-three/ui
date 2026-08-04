import { expect, test } from "@playwright/test";
import {
  TOKEN,
  evalInSandbox,
  expectConsole,
  post,
  requestRows,
  requestTables,
  runNote,
} from "./helpers";

const NOTE = "CREATE TABLE t(a INT); INSERT INTO t VALUES (42); SELECT * FROM t;";

test("sql.js executes, browses tables and answers the REPL in SQL", async ({ page }) => {
  await runNote(page, "sql-sqljs", NOTE);
  await expectConsole(page, "log", "42");

  const tables = await requestTables(page);
  expect(tables).toContainEqual(
    expect.objectContaining({ name: "t", columns: ["a"], rowCount: 1 }),
  );

  const rows = await requestRows(page, { id: 1, table: "t", offset: 0, limit: 50 });
  expect(rows.id).toBe(1);
  expect(rows.rows).toEqual([["42"]]);
  expect(rows.total).toBe(1);

  await evalInSandbox(page, "SELECT 43");
  await expectConsole(page, "log", "43");
});

// Security invariant 5: an identifier from the parent is validated against the
// engine's own catalog before it is spliced into a query.
test("sql.js refuses row queries for tables outside its catalog", async ({ page }) => {
  await runNote(page, "sql-sqljs", NOTE);
  await expectConsole(page, "log", "42");
  await post(page, {
    type: "not3/sandbox/rows/request",
    token: TOKEN,
    query: { id: 9, table: 'sqlite_master" --', offset: 0, limit: 50 },
  });
  await expectConsole(page, "error", "unknown table");
});
