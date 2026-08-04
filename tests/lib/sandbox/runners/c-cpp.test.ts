import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { CppRunner } from "~/lib/sandbox/runners/cpp";
import { CRunner } from "~/lib/sandbox/runners/c";

const ORIGIN = "https://app.example";
const OPTS = { token: "tok", allowNetwork: false, origin: ORIGIN };

describe("CppRunner", () => {
  it("is the default engine for cpp notes", () => {
    expect(defaultRunnerForLanguage("cpp")?.id).toBe("cpp-jscpp");
  });

  it("loads self-hosted JSCPP and streams stdout to the console", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: CppRunner, content: "int main() { return 0; }" });
    expect(doc).toContain(`${ORIGIN}/vendor/jscpp/JSCPP.es5.min.js`);
    expect(doc).toContain("JSCPP.run");
  });
});

describe("CRunner", () => {
  it("is the default engine for c notes", () => {
    expect(defaultRunnerForLanguage("c")?.id).toBe("c-picoc");
  });

  // The brief assumed dist/bundle.js (an ESM re-export) loaded via
  // `await import(...)` with a `runC(code, { output, error })` options
  // object. Neither holds: bundle.js has top-level `import ... from 'path'`
  // (a Node builtin) that browsers cannot resolve, so it throws immediately
  // as a module; the actual published signature is
  // `runC(cprog, consoleWrite)` — see lib/sandbox/runners/c.ts. This
  // runner instead loads the UMD build as a plain <script> tag and reads
  // the `picocjs` global it attaches, exactly like wasmoon (lua.ts).
  it("loads the self-hosted picoc UMD bundle and calls the global runC", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: CRunner, content: "int main() { return 0; }" });
    expect(doc).toContain(`${ORIGIN}/vendor/picoc-js/bundle.umd.js`);
    expect(doc).toContain("picocjs.runC(");
  });
});
