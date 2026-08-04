import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("typescript compiles and executes", async ({ page }) => {
  await runNote(page, "typescript", 'const n: number = 42; console.log("ts", n)');
  await expectConsole(page, "log", "ts 42");
});
