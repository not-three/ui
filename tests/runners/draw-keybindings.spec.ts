import { expect, test, type Page } from "@playwright/test";
import { drawCheckout } from "./draw-path.mjs";

test.skip(!drawCheckout, "Draw checkout unavailable");

const info = {
  version: "2.1.1", availableTokens: 100, maxStorageTimeDays: 30,
  fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
};

async function openApp(page: Page, path = "/") {
  await page.route("**/api/info", (route) => route.fulfill({ json: info }));
  await page.route("**/config.json", (route) => route.fulfill({ json: {
    baseURL: "/api/", drawURL: "http://127.0.0.1:8790",
  } }));
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

async function openDraw(page: Page) {
  await page.getByRole("heading", { name: "Tools" }).click();
  await page.getByRole("button", { name: "Open Excalidraw" }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", "http://127.0.0.1:8790");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator(".excalidraw-container")).toBeVisible({ timeout: 30_000 });
  return frame;
}

test("Ctrl+S saves while the draw iframe is focused", async ({ page }) => {
  await openApp(page);
  const frame = await openDraw(page);
  await frame.locator(".excalidraw-container").click();
  await page.locator("iframe").focus();
  await page.route("**/api/note/json", (route) => route.fulfill({ json: { id: "saved" } }));
  const create = page.waitForRequest((request) => request.url().endsWith("/api/note/json") && request.method() === "POST", { timeout: 15000 });
  await page.keyboard.press("Control+s");
  expect((await create).postDataJSON().content).toBeTruthy();
});

test("rebound x selects rectangle in the draw iframe", async ({ page }) => {
  await saveSettings(page, [{ key: "x", command: "draw.tool.rectangle", when: "not3.draw" }]);
  const frame = await openDraw(page);
  await frame.locator(".excalidraw-container").click();
  await page.locator("iframe").focus();
  await page.keyboard.press("x");
  await expect(frame.getByTestId("toolbar-rectangle")).toBeChecked();
});

test("unmatched v replays Excalidraw selection", async ({ page }) => {
  await openApp(page);
  const frame = await openDraw(page);
  await frame.locator(".excalidraw-container").click();
  await page.locator("iframe").focus();
  await page.keyboard.press("r");
  await expect(frame.getByTestId("toolbar-rectangle")).toBeChecked();
  await page.keyboard.press("v");
  await expect(frame.getByTestId("toolbar-selection")).toBeChecked();
});
