import { expect, test } from "@playwright/test";
import { runNote } from "./helpers";

test("mermaid renders a diagram", async ({ page }) => {
  await runNote(page, "mermaid", "graph TD; A-->B;");
  await expect(page.frameLocator("iframe").locator("svg").first()).toBeVisible({
    timeout: 60_000,
  });
});
