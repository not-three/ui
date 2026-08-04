import { test } from "@playwright/test";
import { expectConsole, runNote } from "./helpers";

// Regression (errors.md): JSCPP has no namespace support, so the canonical
// std::-qualified hello world was a hard parse error.
test("c++ runs a std::-qualified program and says the qualifiers were stripped", async ({ page }) => {
  await runNote(
    page,
    "cpp-jscpp",
    '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}',
  );
  await expectConsole(page, "log", "Hello, World!");
  await expectConsole(page, "info", "std:: qualifiers were removed");
});
