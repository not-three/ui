import { describe, expect, it } from "vitest";
import { replaceCdnUrls } from "~/scripts/vendor-cdn.mjs";

const hosts = ["cdn.jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com", "esm.sh"];
const replacement = "https://vendored.invalid";

describe("CDN URL replacement", () => {
  it("replaces every occurrence of all configured hosts", () => {
    const text = "https://cdn.jsdelivr.net/a https://unpkg.com/b https://cdnjs.cloudflare.com/c https://esm.sh/d https://cdn.jsdelivr.net/e";
    expect(replaceCdnUrls(text, hosts, replacement)).toEqual({
      text: "https://vendored.invalid/a https://vendored.invalid/b https://vendored.invalid/c https://vendored.invalid/d https://vendored.invalid/e",
      count: 5,
    });
  });

  it("matches host punctuation literally and only replaces a matching prefix", () => {
    const text = "https://cdn-jsdelivr.net/a https://cdnXjsdelivr.net/b https://cdn.jsdelivr.net.evil.example/c";
    expect(replaceCdnUrls(text, hosts, replacement)).toEqual({
      text: "https://cdn-jsdelivr.net/a https://cdnXjsdelivr.net/b https://vendored.invalid.evil.example/c",
      count: 1,
    });
  });

  it("treats regex metacharacters in a host as plain text", () => {
    const text = "https://a+b(c)[d]{e}|f^g$h\\i?.example/pkg https://axb(c)[d]{e}|f^g$h\\i?.example/pkg";
    expect(replaceCdnUrls(text, ["a+b(c)[d]{e}|f^g$h\\i?.example"], replacement)).toEqual({
      text: "https://vendored.invalid/pkg https://axb(c)[d]{e}|f^g$h\\i?.example/pkg",
      count: 1,
    });
  });
});
