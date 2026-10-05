import { expect, test, type Page } from "@playwright/test";

const info = {
  version: "2.1.1", availableTokens: 100, maxStorageTimeDays: 30,
  fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
};

async function openApp(page: Page, path = "/") {
  await page.route("**/api/info", (route) => route.fulfill({ json: info }));
  await page.goto(`http://127.0.0.1:8789${path}`);
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30_000 });
}

async function saveSettings(page: Page, keybindings: unknown[]) {
  await openApp(page, "/settings");
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(JSON.stringify({ version: 4, keybindings }));
  await page.keyboard.press("Control+s");
  await expect(page).toHaveURL("http://127.0.0.1:8789/");
}

test("Ctrl+S on the title bar saves the current note", async ({ page }) => {
  await openApp(page);
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("saved from the title bar");
  await page.route("**/api/note/json", (route) => route.fulfill({ json: { id: "saved" } }));
  await page.locator("#logo").click();
  const create = page.waitForRequest((request) => request.url().endsWith("/api/note/json") && request.method() === "POST", { timeout: 15000 });
  await page.keyboard.press("Control+s");
  expect((await create).postDataJSON().content).toBeTruthy();
});

test("Ctrl+K Ctrl+S opens the read-only keymap view", async ({ page }) => {
  await openApp(page);
  await page.locator("#logo").click();
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Control+s");
  await expect(page).toHaveURL("http://127.0.0.1:8789/keybindings");
  await expect(page.locator(".monaco-editor")).toContainText("invalidUserEntries");
});

test("settings can unbind formatting and bind a Monaco command", async ({ page }) => {
  await saveSettings(page, [
    { key: "shift+alt+f", command: "-not3.format" },
    { key: "shift+alt+f", command: "-editor.action.formatDocument" },
    { key: "alt+f", command: "actions.find", when: "editorTextFocus" },
  ]);
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Alt+f");
  await expect(page.locator(".find-widget")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText('{"a":1}');
  await expect(page.locator(".monaco-editor .view-lines")).toContainText('{"a":1}');
  const before = await page.locator(".monaco-editor .view-lines").innerText();
  await page.keyboard.press("Shift+Alt+f");
  expect(await page.locator(".monaco-editor .view-lines").innerText()).toBe(before);
});
