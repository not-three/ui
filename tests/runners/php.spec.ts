import { expect, test } from "@playwright/test";
import { expectNoConsole, runNote } from "./helpers";

// Regression (errors.md): php-wasm serializes every operation through
// navigator.locks.request, which rejects in the iframe's opaque origin.
test("php runs without the Web Locks unhandled rejection", async ({ page }) => {
  await runNote(page, "php-wasm", '<?php echo "Hello, World!";');
  await expect(page.frameLocator("iframe").locator("#php-out")).toContainText(
    "Hello, World!",
    { timeout: 90_000 },
  );
  await expectNoConsole(page, "error", "Unhandled promise rejection");
});
