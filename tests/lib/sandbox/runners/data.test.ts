import MarkdownIt from "markdown-it";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { parseDataTables, queryDataRows } from "~/lib/sandbox/runners/data-parsers";
import { DataTablesRunner } from "~/lib/sandbox/runners/data";

describe("data table parsers", () => {
  it.each([
    ["csv", "name,age,city\nAda,36,London\nBob,42,Berlin", ["name", "age", "city"], [["Ada", "36", "London"], ["Bob", "42", "Berlin"]]],
    ["csv", "name\tage\tcity\nAda\t36\tLondon", ["name", "age", "city"], [["Ada", "36", "London"]]],
    ["csv", "name;age;city\n\"Ada; A\";36;London", ["name", "age", "city"], [["Ada; A", "36", "London"]]],
  ])("parses delimited rows", (language, content, columns, rows) => {
    expect(parseDataTables(content, language, MarkdownIt, Papa).tables[0]).toMatchObject({ name: "data", columns, rows });
  });

  it("unions JSON keys in first-seen order and compacts nested values", () => {
    const result = parseDataTables('[{"a":1,"nested":{"x":2}},{"b":true,"a":null}]', "json");
    expect(result.tables[0]).toMatchObject({
      name: "data",
      columns: ["a", "nested", "b"],
      rows: [["1", '{"x":2}', ""], ["", "", "true"]],
    });
  });

  it("preserves quoted newlines and escaped quotes through PapaParse", () => {
    const result = parseDataTables('name,notes\nAda,"first\nsecond"\nBob,"said ""hi"""', "csv", MarkdownIt, Papa);
    expect(result.tables[0]).toMatchObject({ name: "data", columns: ["name", "notes"], rows: [["Ada", "first\nsecond"], ["Bob", 'said "hi"']] });
  });

  it("reports malformed quoted CSV instead of publishing partial rows", () => {
    const result = parseDataTables('name,notes\nAda,"never closed', "csv", MarkdownIt, Papa);
    expect(result.tables).toEqual([]);
    expect(result.error).toMatch(/CSV parse error.*quote/i);
  });

  it("finds keyed JSON arrays and reports non-tabular JSON", () => {
    const result = parseDataTables('{"users":[{"id":1}],"scores":[[1,2],[3,4]],"other":4}', "json");
    expect(result.tables.map((t) => t.name)).toEqual(["users"]);
    expect(parseDataTables("[[1,2],[3,4]]", "json").message).toBe("No tabular data found");
    expect(parseDataTables('{"x":1}', "json").message).toBe("No tabular data found");
  });

  it("reports invalid JSON as an error without tables", () => {
    const result = parseDataTables('{invalid', "json");
    expect(result.tables).toEqual([]);
    expect(result.error).toMatch(/JSON/i);
  });

  it("finds separate GFM tables and names them after preceding headings", () => {
    const content = "# People\n\n| Name | Age |\n| --- | --- |\n| Ada | 36 |\n\n## Cities\n\n| City | Country |\n| --- | --- |\n| Berlin | DE |";
    const result = parseDataTables(content, "markdown", MarkdownIt);
    expect(result.tables.map((t) => t.name)).toEqual(["People", "Cities"]);
    expect(result.tables[0]).toMatchObject({ columns: ["Name", "Age"], rows: [["Ada", "36"]] });
  });

  it("names unheaded Markdown tables in document order", () => {
    const content = "| A | B |\n| --- | --- |\n| 1 | 2 |\n\n| X | Y |\n| --- | --- |\n| 3 | 4 |";
    expect(parseDataTables(content, "markdown", MarkdownIt).tables.map((table) => table.name)).toEqual(["Table 1", "Table 2"]);
  });

  it("searches, stably sorts and returns at most one 50-row page", () => {
    const table = { name: "items", columns: ["name", "rank"], rows: Array.from({ length: 105 }, (_, i) => [i % 2 ? "match" : "other", String(i)]) };
    const first = queryDataRows([table], { id: 1, table: "items", offset: 0, limit: 200, sortBy: "name", sortDir: "asc" });
    expect(first.total).toBe(105);
    expect(first.rows).toHaveLength(50);
    expect(first.rows[0]).toEqual(["match", "1"]);
    expect(first.rows[1]).toEqual(["match", "3"]);
    const second = queryDataRows([table], { id: 2, table: "items", offset: 50, limit: 50, search: "match" });
    expect(second.total).toBe(52);
    expect(second.rows).toHaveLength(2);
  });
});

describe("data table runner", () => {
  it("advertises the tables-first read-only contract and embeds shared parsers", () => {
    expect(DataTablesRunner).toMatchObject({ id: "data-tables", languages: ["csv", "json", "markdown"], layout: "console", tables: true, defaultTab: "tables", noRepl: true, usesVendor: true });
    const doc = DataTablesRunner.build({ content: "a,b,c\n1,2,3", vendorBase: "https://app.example/vendor", theme: "dark" });
    expect(doc.head).toContain("markdown/markdown.min.js");
    expect(doc.head).toContain("papaparse/papaparse.min.js");
    expect(doc.body).toContain("__not3Tables__");
    expect(doc.body).toContain("__not3Rows__");
    expect(doc.body).not.toContain("https://cdn");
  });
});
