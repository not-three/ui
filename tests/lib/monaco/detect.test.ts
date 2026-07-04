import { describe, expect, it } from "vitest";
import { detectLanguage } from "~/lib/monaco/detect";

const runner =
  (results: { languageId: string; confidence: number }[]) => async () =>
    results;

describe("detectLanguage", () => {
  it("returns plaintext for empty content", async () => {
    expect(await detectLanguage("   ", runner([]))).toBe("plaintext");
  });

  it("uses the model result when confident and supported", async () => {
    expect(
      await detectLanguage(
        "body { color: red; }",
        runner([{ languageId: "css", confidence: 0.9 }]),
      ),
    ).toBe("css");
  });

  it("maps guesslang ids to monaco ids", async () => {
    expect(
      await detectLanguage(
        "print('hi')",
        runner([{ languageId: "py", confidence: 0.8 }]),
      ),
    ).toBe("python");
  });

  it("falls back to regex scoring when the model is not confident", async () => {
    const yaml = ["services:", "  web:", "    image: nginx"].join("\n");
    expect(
      await detectLanguage(yaml, runner([{ languageId: "js", confidence: 0.05 }])),
    ).toBe("yaml");
  });

  it("falls back to regex scoring for unsupported model results", async () => {
    const css = ".a { color: red; }\n@media print { .a { display: none; } }";
    expect(
      await detectLanguage(css, runner([{ languageId: "hs", confidence: 0.9 }])),
    ).toBe("css");
  });

  it("falls back to regex scoring when the model throws", async () => {
    const failing = async () => {
      throw new Error("boom");
    };
    expect(await detectLanguage('{"a": 1}', failing)).toBe("json");
  });
});
