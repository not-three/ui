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

  it("matches host punctuation literally without replacing a longer hostname", () => {
    const text = "https://cdn-jsdelivr.net/a https://cdnXjsdelivr.net/b https://cdn.jsdelivr.net.evil.example/c";
    expect(replaceCdnUrls(text, hosts, replacement)).toEqual({
      text,
      count: 0,
    });
  });

  it.each(["/", "?", "#", '"', "'", ""])("replaces a host followed by %j", (suffix) => {
    expect(replaceCdnUrls(`https://unpkg.com${suffix}`, hosts, replacement)).toEqual({
      text: `${replacement}${suffix}`,
      count: 1,
    });
  });

  it.each([".evil.example", "-evil", "evil", "1"])("keeps a host followed by %j", (suffix) => {
    const text = `https://unpkg.com${suffix}/pkg`;
    expect(replaceCdnUrls(text, hosts, replacement)).toEqual({ text, count: 0 });
  });

  it("replaces adjacent occurrences including a host at end of text", () => {
    expect(replaceCdnUrls("https://unpkg.com/a https://unpkg.com", hosts, replacement)).toEqual({
      text: "https://vendored.invalid/a https://vendored.invalid",
      count: 2,
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
