import { expect, test } from "@playwright/test";
import { expectNoConsole, runNote } from "./helpers";

// Regression (errors.md): the react preset leaves ES module syntax alone, so
// `export default function App()` died in eval with "Unexpected token 'export'".
test("react renders a component exported with export default", async ({ page }) => {
  await runNote(page, "react", "export default function App() { return <h1>Hello, World!</h1>; }");
  await expect(page.frameLocator("iframe").locator("h1")).toHaveText("Hello, World!", {
    timeout: 60_000,
  });
  await expectNoConsole(page, "error");
});

test("react still renders a plain top-level App component", async ({ page }) => {
  await runNote(page, "react", "function App() { return <h1>legacy style</h1>; }");
  await expect(page.frameLocator("iframe").locator("h1")).toHaveText("legacy style", {
    timeout: 60_000,
  });
  await expectNoConsole(page, "error");
});
