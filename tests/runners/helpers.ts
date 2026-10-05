import { expect, type Page } from "@playwright/test";
// Relative imports, not the "~" alias: Playwright transpiles these files
// without Nuxt's tsconfig paths.
import { buildSrcdoc } from "../../lib/sandbox/srcdoc";
import { getRunner } from "../../lib/sandbox/runners";
import {
  SANDBOX_EVAL_MESSAGE,
  SANDBOX_ROWS_REQUEST,
  SANDBOX_ROWS_RESULT,
  SANDBOX_TABLES_REQUEST,
  SANDBOX_TABLES_RESULT,
} from "../../lib/sandbox/protocol";

export const TOKEN = "e2e-token";
export const ORIGIN = "http://127.0.0.1:8788";

/** Arm immediately before a tool run, then call assertNoNetwork after its output appears. App asset chunks and workers remain available. */
export async function withNoNetwork(page: Page) {
  const unexpected: string[] = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://127.0.0.1:8789' && (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/assets/'))) {
      await route.continue();
      return;
    }
    unexpected.push(route.request().url());
    await route.abort();
  });
  return { assertNoNetwork: () => expect(unexpected, `tool sent requests outside app assets: ${unexpected.join(', ')}`).toEqual([]) };
}

type Recorded = Record<string, unknown>;

/** Build a runner's document exactly as the panel does and mount it. */
export async function runNote(page: Page, runnerId: string, content: string, theme: "dark" | "light" = "dark", languageId?: string) {
  const runner = getRunner(runnerId);
  if (!runner) throw new Error("unknown runner: " + runnerId);
  const srcdoc = buildSrcdoc({
    runner,
    content,
    languageId,
    token: TOKEN,
    allowNetwork: false,
    origin: ORIGIN,
    basePath: "/",
    theme,
  });
  await page.goto("/harness.html");
  await page.evaluate((doc) => (window as never as { __mount(d: string): void }).__mount(doc), srcdoc);
}

function messages(page: Page): Promise<Recorded[]> {
  return page.evaluate(() => (window as never as { __messages: Recorded[] }).__messages);
}

/**
 * Text of one relayed console line, joined exactly the way the panel renders
 * it — `console.log("ts", 42)` arrives as two args, and asserting per-arg
 * would make multi-argument logs unmatchable.
 */
function lineText(message: Recorded): string {
  return Array.isArray(message.args) ? message.args.map(String).join(" ") : "";
}

/** Wait until the sandbox relayed a console line of `level` containing `includes`. */
export async function expectConsole(
  page: Page,
  level: string,
  includes: string,
  timeout = 90_000,
) {
  await expect
    .poll(
      async () =>
        (await messages(page))
          .filter((m) => m.token === TOKEN && m.level === level)
          .map(lineText),
      { timeout },
    )
    .toContainEqual(expect.stringContaining(includes));
}

/** Assert no console line of `level` was ever relayed (call after a positive signal). */
export async function expectNoConsole(page: Page, level: string, includes?: string) {
  const all = await messages(page);
  const offenders = all.filter((m) => {
    if (m.level !== level) return false;
    return includes ? lineText(m).includes(includes) : true;
  });
  expect(offenders, `unexpected ${level} messages: ${JSON.stringify(offenders)}`).toEqual([]);
}

export async function post(page: Page, message: Recorded) {
  await page.evaluate(
    (msg) => (window as never as { __post(m: unknown): void }).__post(msg),
    message,
  );
}

/** Send REPL input the way the panel's console input does. */
export async function evalInSandbox(page: Page, code: string) {
  await post(page, { type: SANDBOX_EVAL_MESSAGE, token: TOKEN, code });
}

/**
 * Ask repeatedly until an answer of `type` shows up. The engines install
 * their table hooks only once the database exists, and a request that arrives
 * earlier is silently dropped by the bootstrap — so the panel re-asks, and so
 * does this.
 */
async function askUntilAnswered(
  page: Page,
  request: Recorded,
  type: string,
  tries = 20,
  matches: (message: Recorded) => boolean = () => true,
): Promise<Recorded> {
  for (let i = 0; i < tries; i++) {
    await post(page, request);
    const found = (await messages(page)).filter(
      (m) => m.type === type && m.token === TOKEN && matches(m),
    );
    if (found.length) return found[found.length - 1]!;
    await page.waitForTimeout(700);
  }
  throw new Error(`no ${type} after ${tries} requests`);
}

export async function requestTables(page: Page) {
  const result = await askUntilAnswered(
    page,
    { type: SANDBOX_TABLES_REQUEST, token: TOKEN },
    SANDBOX_TABLES_RESULT,
  );
  return result.tables as { name: string; columns: string[]; rowCount: number }[];
}

export async function requestRows(
  page: Page,
  query: { id: number; table: string; offset: number; limit: number; sortBy?: string; sortDir?: "asc" | "desc"; search?: string },
) {
  const result = await askUntilAnswered(
    page,
    { type: SANDBOX_ROWS_REQUEST, token: TOKEN, query },
    SANDBOX_ROWS_RESULT,
    20,
    (message) => message.id === query.id,
  );
  return result as unknown as { id: number; rows: string[][]; total: number };
}
