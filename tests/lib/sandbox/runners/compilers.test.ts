import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { TypescriptRunner } from "~/lib/sandbox/runners/typescript";
import { CoffeescriptRunner } from "~/lib/sandbox/runners/coffeescript";

const ORIGIN = "https://app.example";
const OPTS = { token: "tok", allowNetwork: false, origin: ORIGIN };

describe("TypescriptRunner", () => {
  it("is the default engine for typescript notes", () => {
    expect(defaultRunnerForLanguage("typescript")?.id).toBe("typescript");
  });

  it("loads the self-hosted compiler and embeds the code JSON-escaped", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: TypescriptRunner, content: 'let x: string = "</script>";' });
    expect(doc).toContain(`${ORIGIN}/vendor/typescript/typescript.js`);
    expect(doc).toContain("ts.transpile");
    expect(doc).not.toContain('"</script>";');
    expect(doc).toContain(`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' ${ORIGIN}`);
  });
});

describe("CoffeescriptRunner", () => {
  it("is the default engine for coffeescript notes", () => {
    expect(defaultRunnerForLanguage("coffeescript")?.id).toBe("coffeescript");
  });

  it("loads the self-hosted compiler", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: CoffeescriptRunner, content: "console.log 42" });
    expect(doc).toContain(`${ORIGIN}/vendor/coffeescript/coffeescript.js`);
    expect(doc).toContain("CoffeeScript.compile");
  });
});
