import { expect, test, type Page } from "@playwright/test";
import { drawCheckout } from "./draw-path.mjs";
import { APP_ORIGIN, DRAW_ORIGIN } from "./helpers";

test.skip(!drawCheckout, "Draw checkout unavailable");

const info = {
  version: "2.1.1", availableTokens: 100, maxStorageTimeDays: 30,
  fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
};

async function openApp(page: Page, path = "/") {
  await page.route("**/api/info", (route) => route.fulfill({ json: info }));
  await page.route("**/config.json", (route) => route.fulfill({ json: {
    baseURL: "/api/", drawURL: DRAW_ORIGIN,
  } }));
  await page.goto(`${APP_ORIGIN}${path}`);
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30_000 });
}

async function saveSettings(page: Page, keybindings: unknown[]) {
  await openApp(page, "/settings");
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(JSON.stringify({ version: 4, keybindings }));
  await page.getByRole("heading", { name: "File" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/`);
}

async function openDraw(page: Page) {
  await page.getByRole("heading", { name: "Tools" }).click();
  await page.getByRole("button", { name: "Open Excalidraw" }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", DRAW_ORIGIN);
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

test("a rebound save works in the editor, title bar, and draw", async ({ page }) => {
  await saveSettings(page, [
    { key: "ctrl+s", command: "-not3.save" },
    { key: "ctrl+alt+s", command: "not3.save" },
  ]);
  let saves = 0;
  await page.route("**/api/note/json", (route) => {
    saves++;
    return route.fulfill({ json: { id: `saved-${saves}` } });
  });
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("rebound save");
  await page.keyboard.press("Control+s");
  await page.waitForTimeout(250);
  expect(saves).toBe(0);
  await page.keyboard.press("Control+Alt+s");
  await expect.poll(() => saves).toBe(1);
  await expect(page).toHaveURL(/\/q\/saved-1#/);
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30_000 });
  await page.locator(".monaco-editor").click();
  await page.keyboard.insertText("save from title");
  await expect(page.locator(".monaco-editor .view-lines")).toContainText("save from title");
  await page.locator("#logo").click();
  await page.keyboard.press("Control+s");
  await page.waitForTimeout(250);
  expect(saves).toBe(1);
  await page.keyboard.press("Control+Alt+s");
  await expect.poll(() => saves).toBe(2);
  await expect(page).toHaveURL(/\/q\/saved-2#/);
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30_000 });
  const frame = await openDraw(page);
  await frame.locator(".excalidraw-container").click();
  await page.locator("iframe").focus();
  await page.keyboard.press("Control+s");
  await page.waitForTimeout(250);
  expect(saves).toBe(2);
  await page.keyboard.press("Control+Alt+s");
  await expect.poll(() => saves).toBe(3);
});

test("draw.key replays rebound undo and redo", async ({ page }) => {
  await saveSettings(page, [
    { key: "ctrl+alt+z", command: "draw.key", args: "ctrl+z", when: "not3.draw" },
    { key: "ctrl+alt+y", command: "draw.key", args: "ctrl+shift+z", when: "not3.draw" },
  ]);
  await page.evaluate(() => {
    const state = window as Window & { drawElements?: Array<{ isDeleted?: boolean }> };
    state.drawElements = [];
    window.addEventListener("message", (event) => {
      if (event.data?.type === "not3/draw/change" && Array.isArray(event.data.payload)) state.drawElements = event.data.payload;
    });
  });
  const frame = await openDraw(page);
  const canvas = frame.locator(".excalidraw-container");
  await canvas.click();
  await page.locator("iframe").focus();
  await page.keyboard.press("r");
  await expect(frame.getByTestId("toolbar-rectangle")).toBeChecked();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 100, box!.y + box!.height / 2 + 80, { steps: 5 });
  await page.mouse.up();
  const activeCount = () => page.evaluate(() =>
    ((window as Window & { drawElements?: Array<{ isDeleted?: boolean }> }).drawElements ?? []).filter((element) => !element.isDeleted).length);
  await expect.poll(activeCount).toBe(1);
  await page.locator("iframe").focus();
  await page.keyboard.press("Control+Alt+z");
  await expect.poll(activeCount).toBe(0);
  await page.keyboard.press("Control+Alt+y");
  await expect.poll(activeCount).toBe(1);
});

test("draw text editing keeps its native keyboard input", async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    const state = window as Window & { forwardedKeys?: string[] };
    state.forwardedKeys = [];
    window.addEventListener("message", (event) => {
      if (event.data?.type === "not3/draw/keys/1/keydown") state.forwardedKeys?.push(event.data.payload?.key);
    });
  });
  const frame = await openDraw(page);
  const canvas = frame.locator(".excalidraw-container");
  await canvas.click();
  await page.locator("iframe").focus();
  await page.keyboard.press("t");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const editor = frame.locator("textarea:visible, [contenteditable='true']:visible").first();
  await expect(editor).toBeVisible();
  await editor.fill("native text");
  const before = await page.evaluate(() => (window as Window & { forwardedKeys?: string[] }).forwardedKeys?.length ?? 0);
  await page.keyboard.press("Control+s");
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => (window as Window & { forwardedKeys?: string[] }).forwardedKeys?.length ?? 0)).toBe(before);
  await expect(editor).toHaveValue("native text");
});
