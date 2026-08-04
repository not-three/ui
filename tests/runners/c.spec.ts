import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("c executes", async ({ page }) => {
  await runNote(page, "c-picoc", '#include <stdio.h>\nint main() { printf("c %d\\n", 42); return 0; }');
  await expectConsole(page, "log", "c 42");
});
