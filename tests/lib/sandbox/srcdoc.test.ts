import { describe, expect, it } from "vitest";
import { SANDBOX_IFRAME_SANDBOX, buildCsp, buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { JavascriptRunner } from "~/lib/sandbox/runners/javascript";
import { HtmlRunner } from "~/lib/sandbox/runners/html";

const TOKEN = "tok-xyz";
const ORIGIN = "https://app.example";

describe("iframe sandbox attribute", () => {
  it("never grants same-origin or top navigation", () => {
    expect(SANDBOX_IFRAME_SANDBOX).toBe("allow-scripts allow-modals");
  });
});

describe("buildCsp", () => {
  it("blocks all network access by default", () => {
    const csp = buildCsp({ allowNetwork: false, vendorOrigin: null, scriptBlob: false });
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).not.toContain("https:");
    expect(csp).not.toContain(ORIGIN);
  });

  it("only opens https/wss when network is allowed", () => {
    const csp = buildCsp({ allowNetwork: true, vendorOrigin: null, scriptBlob: false });
    expect(csp).toContain("connect-src https: wss:");
    expect(csp).toContain("script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https:");
    expect(csp).not.toContain("http:");
  });

  it("allows the app origin (and nothing else) for vendor runners", () => {
    const csp = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: false });
    expect(csp).toContain(`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' ${ORIGIN}`);
    expect(csp).toContain(`connect-src ${ORIGIN}`);
    // Note: ORIGIN itself starts with "https:", so a plain
    // `not.toContain("https:")` (as in the original spec) can never pass here.
    // The property actually under test is that enabling a vendor origin does
    // not also open the generic network-allowed wildcard scheme list.
    expect(csp).not.toContain("wss:");
  });

  it("adds blob: to script-src only when requested", () => {
    const csp = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: true });
    expect(csp).toContain("script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:");
    const plain = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: false });
    expect(plain.match(/script-src [^;]*/)![0]).not.toContain("blob:");
  });
});

describe("buildSrcdoc", () => {
  it("embeds bootstrap (with token) before the user code for javascript", () => {
    const doc = buildSrcdoc({
      runner: JavascriptRunner, content: "console.log(1)", token: TOKEN,
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(TOKEN);
    expect(doc).toContain("console.log(1)");
    expect(doc.indexOf(TOKEN)).toBeLessThan(doc.indexOf("console.log(1)"));
    expect(doc).toContain('http-equiv="Content-Security-Policy"');
  });

  it("escapes closing script tags in javascript content", () => {
    const doc = buildSrcdoc({
      runner: JavascriptRunner, content: 'const s = "</script><img src=x>";',
      token: TOKEN, allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).not.toContain('"</script><img');
    expect(doc).toContain("<\\/script><img src=x>");
  });

  it("prepends CSP and bootstrap to html content and strips a leading doctype", () => {
    const doc = buildSrcdoc({
      runner: HtmlRunner, content: "<!DOCTYPE html><h1>Hi</h1>",
      token: TOKEN, allowNetwork: false, origin: ORIGIN,
    });
    expect(doc.startsWith("<!doctype html>")).toBe(true);
    expect(doc).toContain("<h1>Hi</h1>");
    expect(doc).not.toContain("<!DOCTYPE html>");
    expect(doc.indexOf("Content-Security-Policy")).toBeLessThan(doc.indexOf("<h1>Hi</h1>"));
  });

  it("does not leak the app origin into non-vendor runners", () => {
    const doc = buildSrcdoc({
      runner: JavascriptRunner, content: "1", token: TOKEN,
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).not.toContain(ORIGIN);
  });
});
