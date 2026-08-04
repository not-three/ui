import { expect, test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

test("html renders and relays inline script output", async ({ page }) => {
  await runNote(page, "html", '<h1>hello</h1><script>console.log("inline")</script>');
  await expect(page.frameLocator("iframe").locator("h1")).toHaveText("hello");
  await expectConsole(page, "log", "inline");
});
