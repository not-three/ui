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

test("a one-second-old chord prefix no longer holds Ctrl+S", async ({ page }) => {
  await openApp(page);
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("save after chord timeout");
  await page.locator("#logo").click();
  await page.route("**/api/note/json", (route) => route.fulfill({ json: { id: "saved" } }));
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(1100);
  const create = page.waitForRequest((request) => request.url().endsWith("/api/note/json") && request.method() === "POST", { timeout: 15000 });
  await page.keyboard.press("Control+s");
  expect((await create).postDataJSON().content).toBeTruthy();
  await expect(page).not.toHaveURL("http://127.0.0.1:8789/keybindings");
});

test("Numpad0 binding runs from the title bar", async ({ page }) => {
  await saveSettings(page, [{ key: "numpad0", command: "not3.openKeybindings" }]);
  await page.locator("#logo").click();
  await page.keyboard.press("Numpad0");
  await expect(page).toHaveURL("http://127.0.0.1:8789/keybindings");
});

test("shifted punctuation binding runs from the title bar", async ({ page }) => {
  await saveSettings(page, [{ key: "shift+;", command: "not3.openKeybindings" }]);
  await page.locator("#logo").click();
  await page.keyboard.press("Shift+Semicolon");
  await expect(page).toHaveURL("http://127.0.0.1:8789/keybindings");
});

test("a negative Monaco binding removes the built-in Find shortcut", async ({ page }) => {
  await openApp(page);
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+f");
  await expect(page.locator(".find-widget")).toBeVisible();

  await saveSettings(page, [{ key: "ctrl+f", command: "-actions.find" }]);
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+f");
  await expect(page.locator(".find-widget")).toBeHidden();
});

test("removing not3.format prevents its formatter notification", async ({ page }) => {
  await openApp(page);
  await page.locator("select").first().selectOption("json");
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("invalid json");
  await expect(page.locator(".monaco-editor .view-lines")).toContainText("invalid json");
  await page.keyboard.press("Shift+Alt+f");
  await expect(page.locator(".notification-container p")).toContainText("Could not format note:");

  await saveSettings(page, [{ key: "shift+alt+f", command: "-not3.format" }]);
  await page.locator("select").first().selectOption("json");
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("invalid json");
  await expect(page.locator(".monaco-editor .view-lines")).toContainText("invalid json");
  await page.keyboard.press("Shift+Alt+f");
  await page.waitForTimeout(1000);
  await expect(page.locator(".notification-container p")).not.toContainText("Could not format note:");
});

test("sandbox iframe and REPL input keep native keyboard handling", async ({ page }) => {
  await openApp(page);
  await page.locator("select").first().selectOption("html");
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText('<input id="native-key-input">');
  let saves = 0;
  await page.route("**/api/note/json", (route) => {
    saves++;
    return route.fulfill({ json: { id: "unexpected-save" } });
  });
  await page.locator('button[title="Run / preview this note"]').click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const native = page.frameLocator("iframe").locator("#native-key-input");
  await expect(native).toBeVisible();
  await native.fill("iframe input");
  await page.keyboard.press("Control+s");
  await expect(native).toHaveValue("iframe input");
  const repl = page.getByPlaceholder(/Run .* in the sandbox/);
  await repl.fill("repl input");
  await page.keyboard.press("Control+s");
  await expect(repl).toHaveValue("repl input");
  await page.waitForTimeout(250);
  expect(saves).toBe(0);
});
