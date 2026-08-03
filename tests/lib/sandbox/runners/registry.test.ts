import { describe, expect, it } from "vitest";
import {
  SANDBOX_RUNNERS,
  defaultRunnerForLanguage,
  getRunner,
  isRunnableLanguage,
  runnersForLanguage,
} from "~/lib/sandbox/runners";

describe("runner registry", () => {
  it("has unique runner ids", () => {
    const ids = SANDBOX_RUNNERS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps javascript and html to their runners", () => {
    expect(defaultRunnerForLanguage("javascript")?.id).toBe("javascript");
    expect(defaultRunnerForLanguage("html")?.id).toBe("html");
    expect(getRunner("javascript")?.layout).toBe("console");
    expect(getRunner("html")?.layout).toBe("preview");
  });

  it("rejects unknown or empty languages", () => {
    expect(runnersForLanguage("plaintext")).toEqual([]);
    expect(defaultRunnerForLanguage(null)).toBeNull();
    expect(isRunnableLanguage(undefined)).toBe(false);
    expect(getRunner("nope")).toBeNull();
  });
});

describe("escaping helpers (via util)", () => {
  it("embedJson survives </script> and line separators", async () => {
    const { embedJson } = await import("~/lib/sandbox/runners/util");
    const out = embedJson("</script>\u2028x");
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
    expect(out).toContain("\\u2028");
  });

  it("escapeAttribute escapes quotes and ampersands", async () => {
    const { escapeAttribute } = await import("~/lib/sandbox/runners/util");
    expect(escapeAttribute('a"b&c')).toBe("a&quot;b&amp;c");
  });
});
