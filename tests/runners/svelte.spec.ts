import { expect, test } from "@playwright/test";
import { runNote } from "./helpers";

test("svelte compiles and renders", async ({ page }) => {
  await runNote(page, "svelte", '<script>let name = "svelte";</script>\n<h1>Hello {name}</h1>');
  await expect(page.frameLocator("iframe").locator("h1")).toContainText("svelte", {
    timeout: 60_000,
  });
});
