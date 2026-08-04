import { describe, expect, it } from "vitest";
import { buildPopoutDocument } from "~/lib/sandbox/popout";
import { CONSOLE_LEVELS } from "~/lib/sandbox/protocol";
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

  it("round-trips the srcdoc attribute byte-exact and injects no extra markup", () => {
    // A substring assertion (e.g. `not.toContain('srcdoc="<script>x("')`)
    // still passes even if escapeAttribute stopped escaping `<`, `>`, `'`
    // and newlines — it doesn't protect the property that actually matters.
    // Parse the real document through a real HTML parser instead and prove
    // the srcdoc attribute value survives round-trip exactly, with no
    // attribute breakout and no extra <script>/<iframe> injected.
    const payloads = [
      '"><script>alert(1)</script>',
      "</iframe><script>parent.alert(1)</script>",
      "' onload='alert(1)",
      // Pre-existing &quot; entity: proves the &-then-" escaping order in
      // escapeAttribute doesn't double-escape and corrupt note content.
      'already &quot; encoded "quote"',
    ];
    for (const srcdoc of payloads) {
      const built = buildPopoutDocument({ title: "t", srcdoc, token: TOKEN, layout: "preview" });
      const parsed = new DOMParser().parseFromString(built, "text/html");
      const iframes = parsed.querySelectorAll("iframe");
      const scripts = parsed.querySelectorAll("script");
      expect(iframes.length).toBe(1);
      expect(scripts.length).toBe(1);
      expect(iframes[0].getAttribute("srcdoc")).toBe(srcdoc);
    }
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

  it("whitelists the console level against the protocol's own list", () => {
    const doc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "console" });
    expect(doc).toContain("LEVELS.indexOf(d.level) === -1");
    expect(doc).toContain(JSON.stringify(CONSOLE_LEVELS));
  });

  it("guards against a null contentWindow before comparing event.source", () => {
    const doc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "console" });
    expect(doc).toContain("if (!frame.contentWindow || event.source !== frame.contentWindow) return;");
  });

  it("caps the rendered console lines and documents why", () => {
    const doc = buildPopoutDocument({ title: "t", srcdoc: "x", token: TOKEN, layout: "console" });
    expect(doc).toContain("var MAX_LINES = 500;");
    expect(doc).toContain("while (out.childNodes.length > MAX_LINES) out.removeChild(out.firstChild);");
  });
});
