import { expect, test } from "@playwright/test";
import { APP_ORIGIN } from "./helpers";

const info = {
  version: "2.1.1", availableTokens: 100, maxStorageTimeDays: 30,
  fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
};

// The regex fallback reaches the same verdict for simple samples, so the only
// observable sign of a broken model is the error it logs before falling back.
test("the language detection model loads and classifies editor content", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/api/info", (route) => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30_000 });
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText([
    "import os",
    "",
    "def list_files(path):",
    "    for name in sorted(os.listdir(path)):",
    "        print(name)",
    "",
    "if __name__ == \"__main__\":",
    "    list_files(\".\")",
  ].join("\n"));
  await expect(page.locator("select:has(option[value='python'])")).toHaveValue("python", { timeout: 60_000 });
  expect(errors.filter((text) => text.includes("Language detection model failed"))).toEqual([]);
});
