import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { CppRunner } from "~/lib/sandbox/runners/cpp";
import { CRunner } from "~/lib/sandbox/runners/c";
import { embedJson } from "~/lib/sandbox/runners/util";

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

describe("CppRunner std:: preprocessing", () => {
  it("strips std:: qualifiers so JSCPP can parse them", () => {
    const doc = CppRunner.build({
      content: 'std::cout << "hi" << std::endl;',
      vendorBase: `${ORIGIN}/vendor`,
    });
    expect(doc.body).toContain(embedJson('cout << "hi" << endl;'));
    // The console note below deliberately mentions "std::", so only the
    // embedded program itself must be free of the qualifier.
    const embedded = doc.body.match(/var CODE = (.*);/)?.[1] ?? "";
    expect(embedded).not.toContain("std::");
  });

  it("notes the stripping in the console only when something was stripped", () => {
    const stripped = CppRunner.build({ content: "std::cout << 1;", vendorBase: "v" });
    expect(stripped.body).toContain("STRIPPED = true");
    const untouched = CppRunner.build({
      content: "using namespace std;\nint main() { cout << 1; }",
      vendorBase: "v",
    });
    expect(untouched.body).toContain("STRIPPED = false");
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
