import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("lua executes", async ({ page }) => {
  await runNote(page, "lua-wasmoon", "print(6 * 7)");
  await expectConsole(page, "log", "42");
});
