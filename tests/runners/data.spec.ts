import { expect, test } from "@playwright/test";
import { expectConsole, requestRows, requestTables, runNote } from "./helpers";

test("CSV answers search, stable sort, and one 50-row page per request", async ({ page }) => {
  const source = ["name,rank,group", ...Array.from({ length: 105 }, (_, i) => `item${i},${i},${i % 2 ? "odd" : "even"}`)].join("\n");
  await runNote(page, "data-tables", source);
  await expectConsole(page, "info", "Parsed 1 table(s), 105 row(s)");
  expect(await requestTables(page)).toEqual([{ name: "Data", columns: ["name", "rank", "group"], rowCount: 105 }]);
  const first = await requestRows(page, { id: 1, table: "Data", offset: 0, limit: 200, sortBy: "rank", sortDir: "desc" });
  expect(first.id).toBe(1);
  expect(first.total).toBe(105);
  expect(first.rows).toHaveLength(50);
  expect(first.rows[0]).toEqual(["item104", "104", "even"]);
  const second = await requestRows(page, { id: 2, table: "Data", offset: 50, limit: 50, search: "odd" });
  expect(second.id).toBe(2);
  expect(second.total).toBe(52);
  expect(second.rows).toHaveLength(2);
  expect(second.rows[0]).toEqual(["item101", "101", "odd"]);
});

test("JSON arrays expose separate tables and compact nested cells", async ({ page }) => {
  await runNote(page, "data-tables", '{"users":[{"id":1,"meta":{"role":"admin"}},{"id":2,"name":"Bob"}],"notes":"ignore"}');
  expect(await requestTables(page)).toEqual([{ name: "users", columns: ["id", "meta", "name"], rowCount: 2 }]);
  const result = await requestRows(page, { id: 3, table: "users", offset: 0, limit: 50, search: "admin" });
  expect(result.rows).toEqual([["1", '{"role":"admin"}', ""]]);
  expect(result.total).toBe(1);
});

test("Markdown exposes multiple GFM tables named by headings", async ({ page }) => {
  await runNote(page, "data-tables", "# People\n\n| Name | Age |\n| --- | --- |\n| Ada | 36 |\n\n## Cities\n\n| City | Country |\n| --- | --- |\n| Berlin | DE |");
  expect(await requestTables(page)).toEqual([
    { name: "People", columns: ["Name", "Age"], rowCount: 1 },
    { name: "Cities", columns: ["City", "Country"], rowCount: 1 },
  ]);
  expect((await requestRows(page, { id: 4, table: "Cities", offset: 0, limit: 50 })).rows).toEqual([["Berlin", "DE"]]);
});

test("invalid JSON reports an error and no tables", async ({ page }) => {
  await runNote(page, "data-tables", "{invalid");
  await expectConsole(page, "error", "Invalid JSON");
  expect(await requestTables(page)).toEqual([]);
});
