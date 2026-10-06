import { expect, test } from "@playwright/test";
import { APP_ORIGIN } from "./helpers";

const info = {
  version: "2.1.1",
  availableTokens: 100,
  maxStorageTimeDays: 30,
  fileTransferEnabled: true,
  fileTransferMaxSize: 100,
  privateMode: false,
  p2pEnabled: true,
};

test("Tools shows Format and enabled P2P Transfer on an editable JSON note", async ({ page }) => {
  await page.route("**/api/info", route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await page.locator("select").first().selectOption("json");
  const tools = page.getByRole("heading", { name: "Tools" }).locator("..");
  await tools.getByRole("heading", { name: "Tools" }).click();

  await expect(tools.getByRole("button", { name: "Format", exact: true })).toBeVisible();
  await expect(page.locator('button[title="Format this note"]')).toBeVisible();
  await expect(tools.getByRole("button", { name: "P2P Transfer", exact: true })).toBeEnabled();
});

test("P2P Transfer is disabled when the server feature gate is off", async ({ page }) => {
  await page.route("**/api/info", route => route.fulfill({ json: { ...info, p2pEnabled: false } }));
  await page.goto(`${APP_ORIGIN}/`);
  await page.getByRole("heading", { name: "Tools" }).click();

  await expect(page.getByRole("button", { name: "P2P Transfer", exact: true })).toBeDisabled();
});
