import { describe, expect, it } from "vitest";
import {
  SANDBOX_IFRAME_SANDBOX,
  buildCsp,
  buildSrcdoc,
  sandboxModeForLanguage,
} from "~/lib/sandbox/srcdoc";

const TOKEN = "tok-xyz";

describe("sandboxModeForLanguage", () => {
  it("maps javascript and html, rejects everything else", () => {
    expect(sandboxModeForLanguage("javascript")).toBe("javascript");
    expect(sandboxModeForLanguage("html")).toBe("html");
    expect(sandboxModeForLanguage("python")).toBeNull();
    expect(sandboxModeForLanguage("typescript")).toBeNull();
    expect(sandboxModeForLanguage(null)).toBeNull();
    expect(sandboxModeForLanguage(undefined)).toBeNull();
  });
});

describe("iframe sandbox attribute", () => {
  it("never grants same-origin or top navigation", () => {
    expect(SANDBOX_IFRAME_SANDBOX).toBe("allow-scripts allow-modals");
  });
});

describe("buildCsp", () => {
  it("blocks all network access by default", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).not.toContain("https:");
  });

  it("only opens https/wss when network is allowed", () => {
    const csp = buildCsp(true);
    expect(csp).toContain("connect-src https: wss:");
    expect(csp).toContain("script-src 'unsafe-inline' 'unsafe-eval' https:");
    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toContain("http:");
  });
});

describe("buildSrcdoc", () => {
  it("embeds bootstrap (with token) before the user code in javascript mode", () => {
    const doc = buildSrcdoc({
      mode: "javascript",
      content: "console.log(1)",
      token: TOKEN,
      allowNetwork: false,
    });
    expect(doc).toContain(TOKEN);
    expect(doc).toContain("console.log(1)");
    expect(doc.indexOf(TOKEN)).toBeLessThan(doc.indexOf("console.log(1)"));
    expect(doc).toContain('http-equiv="Content-Security-Policy"');
  });

  it("escapes closing script tags in javascript content", () => {
    const doc = buildSrcdoc({
      mode: "javascript",
      content: 'const s = "</script><img src=x>";',
      token: TOKEN,
      allowNetwork: false,
    });
    expect(doc).not.toContain('"</script><img');
    expect(doc).toContain("<\\/script><img src=x>");
  });

  it("prepends CSP and bootstrap to html content and strips a leading doctype", () => {
    const doc = buildSrcdoc({
      mode: "html",
      content: "<!DOCTYPE html><h1>Hi</h1>",
      token: TOKEN,
      allowNetwork: false,
    });
    expect(doc.startsWith("<!doctype html>")).toBe(true);
    expect(doc).toContain("<h1>Hi</h1>");
    expect(doc).not.toContain("<!DOCTYPE html>");
    expect(doc.indexOf("Content-Security-Policy")).toBeLessThan(doc.indexOf("<h1>Hi</h1>"));
    expect(doc.indexOf(TOKEN)).toBeLessThan(doc.indexOf("<h1>Hi</h1>"));
  });
});
