import { test } from "@playwright/test";
import { evalInSandbox, expectConsole, runNote } from "./helpers";

test("javascript executes and answers the REPL", async ({ page }) => {
  await runNote(page, "javascript", 'console.log("js " + (6*7))');
  await expectConsole(page, "log", "js 42");
  await evalInSandbox(page, "2+2");
  await expectConsole(page, "log", "4");
});
