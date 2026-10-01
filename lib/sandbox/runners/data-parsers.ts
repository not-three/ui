import type { SandboxRowsQuery } from "../protocol";

export interface DataTable {
  name: string;
  columns: string[];
  rows: string[][];
}

interface MarkdownToken {
  type: string;
  content: string;
  children?: MarkdownToken[] | null;
}

type MarkdownParser = new () => { parse(content: string, env: object): MarkdownToken[] };

/** Self-contained pure parser: its source is embedded unchanged in the iframe. */
export function parseDataTables(
  content: string,
  language: string,
  MarkdownIt?: MarkdownParser,
): { tables: DataTable[]; message?: string; error?: string } {
  const tables: DataTable[] = [];
  const cell = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };
  const uniqueName = (base: string): string => {
    let name = base;
    let suffix = 2;
    while (tables.some((table) => table.name === name)) name = `${base} (${suffix++})`;
    return name;
  };

  if (language === "json") {
    let value: unknown;
    try { value = JSON.parse(content); }
    catch (error) { return { tables, error: `Invalid JSON: ${String(error)}` }; }

    const addArray = (name: string, items: unknown[]) => {
      if (!items.length || !items.every((item) => item !== null && typeof item === "object")) return;
      if (items.every(Array.isArray)) {
        const width = Math.max(...items.map((item) => (item as unknown[]).length));
        tables.push({
          name: uniqueName(name),
          columns: Array.from({ length: width }, (_, i) => `Column ${i + 1}`),
          rows: items.map((item) => Array.from({ length: width }, (_, i) => cell((item as unknown[])[i]))),
        });
        return;
      }
      if (!items.every((item) => !Array.isArray(item))) return;
      const objects = items as Record<string, unknown>[];
      const columns = [...new Set(objects.flatMap((item) => Object.keys(item)))];
      if (!columns.length) return;
      tables.push({
        name: uniqueName(name), columns,
        rows: objects.map((item) => columns.map((key) => cell(item[key]))),
      });
    };
    if (Array.isArray(value)) addArray("Data", value);
    else if (value !== null && typeof value === "object") {
      for (const [key, entry] of Object.entries(value)) {
        if (Array.isArray(entry)) addArray(key, entry);
      }
    }
  } else if (language === "csv") {
    const first = content.split(/\r?\n/).find((line) => line.trim()) ?? "";
    const separators = [",", ";", "\t"];
    const countIn = (line: string, separator: string) => {
      let count = 0;
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          if (quoted && line[i + 1] === '"') i++;
          else quoted = !quoted;
        } else if (!quoted && line[i] === separator) count++;
      }
      return count;
    };
    const delimiter = separators.sort((a, b) => countIn(first, b) - countIn(first, a))[0];
    const records: string[][] = [];
    let record: string[] = [];
    let field = "";
    let quoted = false;
    const source = content.replace(/\r\n/g, "\n");
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      if (ch === '"') {
        if (quoted && source[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && ch === delimiter) {
        record.push(field); field = "";
      } else if (!quoted && ch === "\n") {
        record.push(field); field = "";
        if (record.some((value) => value !== "")) records.push(record);
        record = [];
      } else field += ch;
    }
    record.push(field);
    if (record.some((value) => value !== "")) records.push(record);
    if (records.length >= 2 && records[0]!.length >= 2) {
      const columns = records[0]!;
      tables.push({ name: "Data", columns, rows: records.slice(1).map((row) => columns.map((_, i) => row[i] ?? "")) });
    }
  } else if (language === "markdown" && MarkdownIt) {
    const tokens = new MarkdownIt().parse(content, {});
    let heading = "Table";
    let current: DataTable | null = null;
    let row: string[] = [];
    let inHeading = false;
    let inCell = false;
    for (const token of tokens) {
      if (token.type === "heading_open") inHeading = true;
      else if (token.type === "heading_close") inHeading = false;
      else if (token.type === "table_open") current = { name: uniqueName(heading), columns: [], rows: [] };
      else if (token.type === "tr_open" && current) row = [];
      else if ((token.type === "th_open" || token.type === "td_open") && current) inCell = true;
      else if ((token.type === "th_close" || token.type === "td_close") && current) inCell = false;
      else if (token.type === "inline") {
        const text = token.children?.filter((part) => part.type === "text" || part.type === "code_inline").map((part) => part.content).join("") ?? token.content;
        if (inHeading) heading = text || "Table";
        else if (current && inCell) row.push(text);
      } else if (token.type === "tr_close" && current) {
        if (!current.columns.length) current.columns = row;
        else current.rows.push(row);
      } else if (token.type === "table_close" && current) {
        tables.push(current);
        current = null;
      }
    }
  }
  return tables.length ? { tables } : { tables, message: "No tabular data found" };
}

/** Runs only inside the iframe for live requests; never sends the full dataset. */
export function queryDataRows(tables: DataTable[], query: SandboxRowsQuery): { rows: string[][]; total: number } {
  const table = tables.find((entry) => entry.name === query.table);
  if (!table) throw new Error(`unknown table: ${query.table}`);
  const search = String(query.search ?? "").toLocaleLowerCase();
  const filtered = search
    ? table.rows.filter((row) => row.some((value) => value.toLocaleLowerCase().includes(search)))
    : table.rows;
  const sortIndex = table.columns.indexOf(query.sortBy ?? "");
  const rows = sortIndex < 0 ? filtered : filtered
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const order = (a.row[sortIndex] ?? "").localeCompare(b.row[sortIndex] ?? "", undefined, { numeric: true, sensitivity: "base" });
      return (query.sortDir === "desc" ? -order : order) || a.index - b.index;
    })
    .map(({ row }) => row);
  const offset = Math.max(0, Math.floor(Number(query.offset) || 0));
  const limit = Math.min(50, Math.max(1, Math.floor(Number(query.limit) || 50)));
  return { rows: rows.slice(offset, offset + limit), total: rows.length };
}
