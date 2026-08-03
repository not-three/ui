import { describe, expect, it } from "vitest";
import { SANDBOX_IFRAME_SANDBOX, buildCsp, buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { JavascriptRunner } from "~/lib/sandbox/runners/javascript";
import { HtmlRunner } from "~/lib/sandbox/runners/html";

const TOKEN = "tok-xyz";
const ORIGIN = "https://app.example";

/**
 * Extract a CSP directive's value as whitespace-separated tokens. Used
 * instead of substring assertions: ORIGIN ("https://app.example") itself
 * contains the text "https:", so a plain `toContain`/`not.toContain` check
 * against a CSP string can pass even when the wrong tokens are present (e.g.
 * a conflated allowNetwork/vendorOrigin flag widening script-src to the bare
 * "https:" scheme). Tokenizing the directive and checking membership avoids
 * that aliasing.
 */
function directive(csp: string, name: string): string[] {
  const match = csp.match(new RegExp(`(?:^|; )${name} ([^;]*)`));
  return match ? match[1].split(" ") : [];
}

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
    // Token-level check (see `directive` helper above): the generic wildcard
    // schemes must NOT be members of script-src/connect-src even though
    // ORIGIN's own text contains "https:". This is what actually catches a
    // buildCsp that conflates allowNetwork and vendorOrigin.
    expect(directive(csp, "script-src")).toContain(ORIGIN);
    expect(directive(csp, "script-src")).not.toContain("https:");
    expect(directive(csp, "script-src")).not.toContain("wss:");
    expect(directive(csp, "connect-src")).toContain(ORIGIN);
    expect(directive(csp, "connect-src")).not.toContain("https:");
    expect(directive(csp, "connect-src")).not.toContain("wss:");
  });

  it("adds blob: to script-src only when requested", () => {
    const csp = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: true });
    expect(csp).toContain("script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:");
    const plain = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: false });
    expect(plain.match(/script-src [^;]*/)![0]).not.toContain("blob:");
  });

  it("omits worker-src for runners that need neither blob workers nor vendor assets", () => {
    const csp = buildCsp({ allowNetwork: false, vendorOrigin: null, scriptBlob: false });
    // Plain javascript/html notes must keep the pre-refactor behaviour of
    // blocking Worker construction outright (no worker-src -> falls back to
    // script-src -> default-src 'none').
    expect(csp).not.toContain("worker-src");
  });

  it("declares worker-src (blob: and the vendor origin) once a runner needs it", () => {
    const withVendor = buildCsp({ allowNetwork: false, vendorOrigin: ORIGIN, scriptBlob: false });
    expect(directive(withVendor, "worker-src")).toContain("blob:");
    expect(directive(withVendor, "worker-src")).toContain(ORIGIN);

    const withScriptBlob = buildCsp({ allowNetwork: false, vendorOrigin: null, scriptBlob: true });
    expect(directive(withScriptBlob, "worker-src")).toContain("blob:");
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
    expect(doc.indexOf(TOKEN)).toBeLessThan(doc.indexOf("<h1>Hi</h1>"));
  });

  it("does not leak the app origin into non-vendor runners", () => {
    const doc = buildSrcdoc({
      runner: JavascriptRunner, content: "1", token: TOKEN,
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).not.toContain(ORIGIN);
  });
});
