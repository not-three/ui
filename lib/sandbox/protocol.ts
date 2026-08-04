export const SANDBOX_CONSOLE_MESSAGE = "not3/sandbox/console";
export const SANDBOX_READY_MESSAGE = "not3/sandbox/ready";
export const SANDBOX_EVAL_MESSAGE = "not3/sandbox/eval";
// Table viewer: the parent asks, the iframe answers from its live database.
// Rows are fetched a page at a time so a large dump never crosses the
// postMessage boundary in bulk.
export const SANDBOX_TABLES_REQUEST = "not3/sandbox/tables/request";
export const SANDBOX_TABLES_RESULT = "not3/sandbox/tables/result";
export const SANDBOX_ROWS_REQUEST = "not3/sandbox/rows/request";
export const SANDBOX_ROWS_RESULT = "not3/sandbox/rows/result";

export const CONSOLE_LEVELS = ["log", "info", "warn", "error", "debug", "clear"] as const;
export type ConsoleLevel = (typeof CONSOLE_LEVELS)[number];

/** One run of console text, optionally styled by a `%c` directive. */
export type SandboxConsoleSegment = { text: string; css: string };

export type SandboxConsoleMessage = {
  type: typeof SANDBOX_CONSOLE_MESSAGE;
  level: ConsoleLevel;
  args: string[];
  /** Present when the message used `%c`; renders instead of `args`. */
  segments?: SandboxConsoleSegment[];
};
export type SandboxReadyMessage = { type: typeof SANDBOX_READY_MESSAGE };

/** One table of the runner's live database, as reported by the iframe. */
export type SandboxTableInfo = { name: string; columns: string[]; rowCount: number };

/** A page request for one table. `id` is echoed so stale pages are dropped. */
export type SandboxRowsQuery = {
  id: number;
  table: string;
  offset: number;
  limit: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
};

export type SandboxTablesResultMessage = {
  type: typeof SANDBOX_TABLES_RESULT;
  tables: SandboxTableInfo[];
};

export type SandboxRowsResultMessage = {
  type: typeof SANDBOX_ROWS_RESULT;
  id: number;
  /** Filtered row count for the pager, not the size of `rows`. */
  total: number;
  rows: string[][];
};

export type SandboxMessage =
  | SandboxConsoleMessage
  | SandboxReadyMessage
  | SandboxTablesResultMessage
  | SandboxRowsResultMessage;

const MAX_CSS_LENGTH = 1000;
const MAX_SEGMENTS = 200;
const MAX_CELL_LENGTH = 10000;
const MAX_TABLES = 500;
const MAX_COLUMNS = 200;
const MAX_ROWS = 200;

/**
 * CSS properties a `%c` style may set. Mirrors the subset browsers accept for
 * console formatting, minus anything that could move a segment out of the
 * console pane or cover the surrounding UI (position, z-index, size,
 * transform, animation, content, …).
 */
const ALLOWED_CSS_PROPERTIES = new Set([
  "background",
  "background-attachment",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-repeat",
  "background-size",
  "border",
  "border-bottom",
  "border-color",
  "border-left",
  "border-radius",
  "border-right",
  "border-style",
  "border-top",
  "border-width",
  "box-decoration-break",
  "box-shadow",
  "color",
  "cursor",
  "display",
  "font",
  "font-family",
  "font-size",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "opacity",
  "outline",
  "outline-color",
  "outline-style",
  "outline-width",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-shadow",
  "text-transform",
  "vertical-align",
  "white-space",
  "word-break",
  "word-spacing",
  "word-wrap",
]);

// Values that could fetch a resource (a side channel even with CSP on) or
// try to break out of the inline style attribute.
const FORBIDDEN_CSS_VALUE = /url\(|image-set\(|@import|expression\(|javascript:|[\\<>{}]/i;

/**
 * Reduce an untrusted `%c` style string to a safe inline style. Unknown
 * properties and suspicious values are dropped rather than escaped.
 */
export function sanitizeConsoleCss(css: string): string {
  if (!css || css.length > MAX_CSS_LENGTH) return "";
  const declarations: string[] = [];
  for (const declaration of css.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator === -1) continue;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    if (!value || !ALLOWED_CSS_PROPERTIES.has(property)) continue;
    if (FORBIDDEN_CSS_VALUE.test(value)) continue;
    declarations.push(`${property}: ${value}`);
  }
  return declarations.join("; ");
}

function parseSegments(value: unknown): SandboxConsoleSegment[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value.slice(0, MAX_SEGMENTS).map((entry) => {
    const segment = (typeof entry === "object" && entry !== null ? entry : {}) as Record<
      string,
      unknown
    >;
    const text = "text" in segment ? segment.text : entry;
    return {
      text: typeof text === "string" ? text : String(text),
      css: typeof segment.css === "string" ? sanitizeConsoleCss(segment.css) : "",
    };
  });
}

/**
 * Everything below comes out of the iframe, so every name and cell is
 * untrusted: coerce to string, clamp the length, and cap the collection
 * sizes so a hostile (or just huge) result cannot lock up the renderer.
 * Callers must still render these only through Vue text interpolation.
 */
function toCell(value: unknown): string {
  const text = typeof value === "string" ? value : String(value);
  return text.length > MAX_CELL_LENGTH ? text.slice(0, MAX_CELL_LENGTH) + "…" : text;
}

function toCount(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseTables(value: unknown): SandboxTableInfo[] | null {
  if (!Array.isArray(value)) return null;
  return value.slice(0, MAX_TABLES).map((entry) => {
    const table = (typeof entry === "object" && entry !== null ? entry : {}) as Record<
      string,
      unknown
    >;
    const columns = Array.isArray(table.columns)
      ? table.columns.slice(0, MAX_COLUMNS).map(toCell)
      : [];
    return {
      name: toCell(table.name),
      columns,
      rowCount: toCount(table.rowCount) ?? 0,
    };
  });
}

function parseRows(value: unknown): string[][] | null {
  if (!Array.isArray(value)) return null;
  return value
    .slice(0, MAX_ROWS)
    .map((row) => (Array.isArray(row) ? row.slice(0, MAX_COLUMNS).map(toCell) : []));
}

/**
 * Validate an untrusted postMessage payload from the sandbox iframe.
 * Returns null unless the payload carries the expected per-run token.
 */
export function parseSandboxMessage(data: unknown, token: string): SandboxMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as Record<string, unknown>;
  if (msg.token !== token) return null;
  if (msg.type === SANDBOX_READY_MESSAGE) return { type: SANDBOX_READY_MESSAGE };
  if (msg.type === SANDBOX_TABLES_RESULT) {
    const tables = parseTables(msg.tables);
    if (!tables) return null;
    return { type: SANDBOX_TABLES_RESULT, tables };
  }
  if (msg.type === SANDBOX_ROWS_RESULT) {
    const id = toCount(msg.id);
    const total = toCount(msg.total);
    const rows = parseRows(msg.rows);
    if (id === null || total === null || !rows) return null;
    return { type: SANDBOX_ROWS_RESULT, id, total, rows };
  }
  if (msg.type !== SANDBOX_CONSOLE_MESSAGE) return null;
  if (!CONSOLE_LEVELS.includes(msg.level as ConsoleLevel)) return null;
  if (!Array.isArray(msg.args)) return null;
  const segments = parseSegments(msg.segments);
  return {
    type: SANDBOX_CONSOLE_MESSAGE,
    level: msg.level as ConsoleLevel,
    args: msg.args.map((a) => (typeof a === "string" ? a : String(a))),
    ...(segments ? { segments } : {}),
  };
}
