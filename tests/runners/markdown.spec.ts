import { expect, test } from "@playwright/test";
import { runNote } from "./helpers";

test("markdown preview renders safe rich content", async ({ page }) => {
  await runNote(page, "markdown-preview", [
    "# Heading",
    "",
    "<img src=x onerror=alert(1)>",
    "<script>document.body.dataset.bad = 'true'</script>",
    "",
    "[outside](https://example.com)",
    "[unsafe](javascript:alert(1))",
    "",
    "- [x] done",
    "- [ ] pending",
    "",
    "| Name | Value |",
    "| --- | --- |",
    "| a | b |",
    "",
    "```js",
    "const value = 1;",
    "```",
    "",
    "```mermaid",
    "graph TD; A-->B;",
    "```",
  ].join("\n"));

  const frame = page.frameLocator("iframe");
  await expect(frame.locator("h1#heading")).toHaveText("Heading");
  await expect(frame.locator("img")).toHaveCount(0);
  await expect(frame.locator("body")).toContainText("<img src=x onerror=alert(1)>");
  await expect(frame.locator("body")).toContainText("<script>document.body.dataset.bad = 'true'</script>");
  await expect(frame.locator("body")).not.toHaveAttribute("data-bad", "true");
  await expect(frame.locator("a[href='https://example.com']")).toHaveAttribute("target", "_blank");
  await expect(frame.locator("a[href='https://example.com']")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(frame.locator("a[href^='javascript:']")).toHaveCount(0);
  await frame.locator("a[href='https://example.com']").click();
  await expect(page).toHaveURL(/\/harness\.html$/);
  await expect(frame.locator("input[type=checkbox]")).toHaveCount(2);
  await expect(frame.locator("input[type=checkbox]").first()).toBeChecked();
  await expect(frame.locator("table tbody tr td")).toHaveText(["a", "b"]);
  await expect(frame.locator("pre code .hljs-keyword")).toContainText("const");
  await expect(frame.locator("svg").first()).toBeVisible({ timeout: 60_000 });
});

test("markdown preview uses the requested palette", async ({ page }) => {
  await runNote(page, "markdown-preview", "# Theme", "dark");
  const preview = page.frameLocator("iframe").locator(".markdown-preview");
  await expect(preview).toHaveCSS("background-color", "rgb(17, 17, 17)");

  await runNote(page, "markdown-preview", "# Theme", "light");
  await expect(preview).toHaveCSS("background-color", "rgb(255, 255, 255)");
});
