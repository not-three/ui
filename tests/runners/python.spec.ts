import { test } from "@playwright/test";
import { evalInSandbox, expectConsole, runNote } from "./helpers";

test("python executes and answers the REPL in python", async ({ page }) => {
  await runNote(page, "python-pyodide", "print(21 * 2)");
  await expectConsole(page, "log", "42");
  // Regression: the REPL used to eval this as JavaScript.
  await evalInSandbox(page, "1 + 2");
  await expectConsole(page, "log", "3");
});
