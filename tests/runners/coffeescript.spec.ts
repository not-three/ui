import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("coffeescript compiles and executes", async ({ page }) => {
  await runNote(page, "coffeescript", 'console.log "coffee #{6*7}"');
  await expectConsole(page, "log", "coffee 42");
});
