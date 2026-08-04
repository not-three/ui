import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage, runnersForLanguage } from "~/lib/sandbox/runners";
import { ReactRunner } from "~/lib/sandbox/runners/react";

const ORIGIN = "https://app.example";

describe("ReactRunner", () => {
  it("is the default for jsx and an alternative engine for javascript", () => {
    expect(defaultRunnerForLanguage("jsx")?.id).toBe("react");
    expect(runnersForLanguage("javascript").map((r) => r.id)).toContain("react");
    expect(defaultRunnerForLanguage("javascript")?.id).toBe("javascript");
  });

  it("loads self-hosted react + babel and auto-renders App", () => {
    const doc = buildSrcdoc({
      runner: ReactRunner, content: "function App() { return <h1>hi</h1>; }",
      token: "tok", allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(`${ORIGIN}/vendor/react/react.production.min.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/react/react-dom.production.min.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/babel/babel.min.js`);
    expect(doc).toContain('type="text/babel"');
    expect(doc).toContain("ReactDOM.createRoot");
    expect(doc).toContain("<h1>hi</h1>"); // user code passes through for babel
  });
});
