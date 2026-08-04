import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("ruby executes", async ({ page }) => {
  await runNote(page, "ruby-wasm", "puts 6 * 7");
  await expectConsole(page, "log", "42");
});
