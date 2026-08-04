import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { PythonRunner } from "~/lib/sandbox/runners/python";

const ORIGIN = "https://app.example";

describe("PythonRunner", () => {
  it("is the default engine for python notes and is marked heavy", () => {
    expect(defaultRunnerForLanguage("python")?.id).toBe("python-pyodide");
    expect(PythonRunner.heavy).toBe(true);
  });

  it("loads self-hosted pyodide with the right indexURL", () => {
    const doc = buildSrcdoc({
      runner: PythonRunner, content: 'print("hi")', token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(`${ORIGIN}/vendor/pyodide/pyodide.js`);
    expect(doc).toContain(`indexURL: "${ORIGIN}/vendor/pyodide/"`);
    expect(doc).toContain('print(\\"hi\\")');
    expect(doc).toContain(`connect-src ${ORIGIN}`);
  });

  it("auto-loads vendored wheels and explains missing ones", () => {
    const doc = buildSrcdoc({
      runner: PythonRunner, content: "import numpy", token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain("loadPackagesFromImports");
    expect(doc).toContain("standard library");
  });

  it("declares a Python repl and installs the eval hook", () => {
    expect(PythonRunner.replLanguage).toBe("Python");
    const doc = buildSrcdoc({
      runner: PythonRunner, content: "print(1)", token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain("__not3Eval__");
    expect(doc).toContain("runPythonAsync");
  });
});
