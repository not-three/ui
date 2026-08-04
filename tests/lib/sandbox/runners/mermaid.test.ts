import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { MermaidRunner } from "~/lib/sandbox/runners/mermaid";

const ORIGIN = "https://app.example";

describe("MermaidRunner", () => {
  it("is the default engine for mermaid notes with preview layout", () => {
    expect(defaultRunnerForLanguage("mermaid")?.id).toBe("mermaid");
    expect(MermaidRunner.layout).toBe("preview");
  });

  it("html-escapes the diagram source into a pre.mermaid block", () => {
    const doc = buildSrcdoc({
      runner: MermaidRunner, content: "graph TD; A-->B<script>", token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(`${ORIGIN}/vendor/mermaid/mermaid.min.js`);
    expect(doc).toContain('<pre class="mermaid">');
    expect(doc).toContain("A--&gt;B&lt;script&gt;");
    expect(doc).not.toContain("A-->B<script>");
  });
});
