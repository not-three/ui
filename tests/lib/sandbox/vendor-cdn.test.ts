import { describe, expect, it } from "vitest";
import { buildCdnPattern } from "~/scripts/vendor-cdn.mjs";

describe("CDN host matching", () => {
  it("treats every regex metacharacter in a host as literal", () => {
    const pattern = buildCdnPattern(["a+b(c)[d]{e}|f^g$h\\i?.example"]);
    expect("https://a+b(c)[d]{e}|f^g$h\\i?.example/pkg".replaceAll(pattern, "https://vendored.invalid"))
      .toBe("https://vendored.invalid/pkg");
    expect(pattern.test("https://axb(c)[d]{e}|f^g$h\\i?.example/pkg")).toBe(false);
  });
});
