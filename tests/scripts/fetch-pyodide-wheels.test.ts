import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = join(__dirname, "..", "..", "scripts", "fetch-pyodide-wheels.mjs");
let root: string | undefined;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

describe("fetch-pyodide-wheels", () => {
  it("soft-fails without pyodide installed or vendored", () => {
    root = mkdtempSync(join(tmpdir(), "wheels-"));
    mkdirSync(join(root, "scripts"));
    copyFileSync(script, join(root, "scripts", "fetch-pyodide-wheels.mjs"));
    const result = spawnSync(process.execPath, [join(root, "scripts", "fetch-pyodide-wheels.mjs")], { encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain("pyodide-lock.json missing");
  });
});
