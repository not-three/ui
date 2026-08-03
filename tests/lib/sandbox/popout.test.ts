import { describe, expect, it } from "vitest";
import { buildPopoutDocument } from "~/lib/sandbox/popout";
import { SANDBOX_IFRAME_SANDBOX } from "~/lib/sandbox/srcdoc";

const TOKEN = "tok-pop";

describe("buildPopoutDocument", () => {
  it("embeds the srcdoc attribute-escaped inside a sandboxed iframe", () => {
    const doc = buildPopoutDocument({
      title: "t", srcdoc: '<script>x("</script>")</script>', token: TOKEN, layout: "preview",
    });
    expect(doc).toContain(`sandbox="${SANDBOX_IFRAME_SANDBOX}"`);
    expect(doc).toContain("&quot;");
    // The raw srcdoc must not terminate the iframe attribute:
    expect(doc).not.toContain('srcdoc="<script>x("');
  });

  it("validates source and token before rendering console lines", () => {
    const doc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "console" });
    expect(doc).toContain("event.source !== frame.contentWindow");
    expect(doc).toContain(JSON.stringify(TOKEN));
  });

  it("hides the iframe for console layout and keeps it for preview", () => {
    const consoleDoc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "console" });
    const previewDoc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "preview" });
    expect(consoleDoc).toContain("iframe{display:none}");
    expect(previewDoc).not.toContain("iframe{display:none}");
  });

  it("escapes the window title", () => {
    const doc = buildPopoutDocument({
      title: "<img src=x>", srcdoc: "x", token: TOKEN, layout: "console",
    });
    expect(doc).not.toContain("<img src=x>");
  });
});
