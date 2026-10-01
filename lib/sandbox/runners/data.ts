import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { parseDataTables, queryDataRows } from "./data-parsers";
import { embedJson } from "./util";

export const DataTablesRunner: SandboxRunner = {
  id: "data-tables",
  label: "Data tables",
  languages: ["csv", "json", "markdown"],
  layout: "console",
  tables: true,
  defaultTab: "tables",
  noRepl: true,
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.markdown}"></script>`,
    body: `<script>
(function () {
  var source = ${embedJson(content)};
  var first = source.trimStart();
  var language = first.charAt(0) === "{" || first.charAt(0) === "[" ? "json" : /^(?:#{1,6}\\s|[\\s\\S]*\\|[ \\t]*:?-{3,})/m.test(first) ? "markdown" : "csv";
  var parse = (${parseDataTables.toString()});
  var query = (${queryDataRows.toString()});
  var result = parse(source, language, window.__not3Markdown && window.__not3Markdown.MarkdownIt);
  var tables = result.tables;
  window.__not3Tables__ = function () {
    return tables.map(function (table) {
      return { name: table.name, columns: table.columns, rowCount: table.rows.length };
    });
  };
  window.__not3Rows__ = function (request) { return query(tables, request); };
  if (result.error) console.error(result.error);
  else if (result.message) console.info(result.message);
  else console.info("Parsed " + tables.length + " table(s), " + tables.reduce(function (sum, table) { return sum + table.rows.length; }, 0) + " row(s)");
})();
</script>`,
  }),
};
