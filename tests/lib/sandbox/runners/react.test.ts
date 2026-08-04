import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage, runnersForLanguage } from "~/lib/sandbox/runners";
import { ReactRunner } from "~/lib/sandbox/runners/react";

const ORIGIN = "https://app.example";
const OPTS = { token: "tok", allowNetwork: false, origin: ORIGIN };

describe("ReactRunner", () => {
  it("is the default for jsx and an alternative engine for javascript", () => {
    expect(defaultRunnerForLanguage("jsx")?.id).toBe("react");
    expect(runnersForLanguage("javascript").map((r) => r.id)).toContain("react");
    expect(defaultRunnerForLanguage("javascript")?.id).toBe("javascript");
  });

  it("loads self-hosted react + babel and invokes Babel.transform explicitly", () => {
    const doc = buildSrcdoc({
      ...OPTS, runner: ReactRunner, content: "function App() { return <h1>hi</h1>; }",
    });
    expect(doc).toContain(`${ORIGIN}/vendor/react/react.production.min.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/react/react-dom.production.min.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/babel/babel.min.js`);
    expect(doc).toContain("Babel.transform");
    expect(doc).toContain("ReactDOM.createRoot");
    // The note is JSON-embedded (like every other compiler runner in this
    // codebase), never spliced as raw source: the JSX tag survives only in
    // its <-escaped form (embedJson escapes "<" only, not ">"), never as
    // literal HTML.
    expect(doc).toContain("\\u003ch1>hi");
    expect(doc).not.toContain("<h1>hi</h1>");
    expect(doc).not.toContain('type="text/babel"');
  });

  it("compiles with the commonjs module transform and a require shim", () => {
    const doc = ReactRunner.build({ content: "export default () => null;", vendorBase: "v" });
    expect(doc.body).toContain("transform-modules-commonjs");
    expect(doc.body).toContain('if (name === "react") return React;');
    expect(doc.body).toContain("moduleShim.exports.default");
  });

  // Regression: raw-source embedding via escapeScriptClose broke on a literal
  // <script> element inside JSX (Babel would see an injected "<\/script" and
  // throw "Expecting Unicode escape sequence \uXXXX"), and on an unbalanced
  // "<!--<script>" that pushed the HTML tokenizer into script-data-double-
  // escaped state and swallowed the runner's own closing tags. JSON-embedding
  // the note sidesteps both: no raw "<" from user content ever reaches the
  // HTML parser.
  it("survives a literal <script> element inside JSX unmangled", () => {
    const doc = buildSrcdoc({
      ...OPTS, runner: ReactRunner,
      content: "function App() { return <div><script>console.log(1)</script></div>; }",
    });
    expect(doc).not.toContain("<\\/script");
    expect(doc).not.toContain("</script>console.log");
    expect(doc).toContain("\\u003cscript>console.log(1)\\u003c/script>");
  });
});
