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
    const yaml = [
      "name: ci",
      "on:",
      "  push:",
      "    branches: [main]",
      "jobs:",
      "  build:",
      "    runs-on: ubuntu-latest",
    ].join("\n");
    expect(
      await detectLanguage(yaml, runner([{ languageId: "js", confidence: 0.05 }])),
    ).toBe("yaml");
  });

  it("upgrades a confident yaml verdict to dockercompose for compose files", async () => {
    const compose = [
      "services:",
      "  web:",
      "    image: nginx",
      "    ports:",
      '      - "80:80"',
    ].join("\n");
    expect(
      await detectLanguage(
        compose,
        runner([{ languageId: "yaml", confidence: 0.95 }]),
      ),
    ).toBe("dockercompose");
  });

  it("detects dockercompose via regex fallback", async () => {
    const compose = [
      'version: "3.8"',
      "services:",
      "  db:",
      "    image: postgres:16",
      "    volumes:",
      "      - data:/var/lib/postgresql/data",
    ].join("\n");
    expect(
      await detectLanguage(
        compose,
        runner([{ languageId: "js", confidence: 0.01 }]),
      ),
    ).toBe("dockercompose");
  });

  it("leaves non-compose yaml with a services key as yaml", async () => {
    // Has `services:` but not as a top-level mapping — must stay yaml.
    const yaml = ["app:", "  services: 3", "  name: demo"].join("\n");
    expect(
      await detectLanguage(yaml, runner([{ languageId: "yaml", confidence: 0.95 }])),
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
