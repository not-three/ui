import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { splitFile, splitLargeFiles } from "../../scripts/vendor-split.mjs";

let root: string | undefined;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = undefined; });

describe("vendor split", () => {
  it("cuts an oversized file into ordered parts whose concatenation is the original, and leaves small files alone", () => {
    root = mkdtempSync(join(tmpdir(), "vendor-split-"));
    const big = new Uint8Array(2500).map((_, index) => index % 251);
    writeFileSync(join(root, "big.wasm"), big);
    writeFileSync(join(root, "small.wasm"), new Uint8Array(100));
    const written = splitLargeFiles(root, 1000);
    expect(written).toHaveLength(1);
    expect(existsSync(join(root, "big.wasm"))).toBe(false);
    expect(existsSync(join(root, "small.wasm"))).toBe(true);
    const manifest = JSON.parse(readFileSync(join(root, "big.wasm.parts.json"), "utf8")) as { size: number; parts: { name: string; size: number }[] };
    expect(manifest.size).toBe(2500);
    expect(manifest.parts.map(part => part.size)).toEqual([1000, 1000, 500]);
    const joined = Buffer.concat(manifest.parts.map(part => readFileSync(join(root!, part.name))));
    expect(new Uint8Array(joined)).toEqual(big);
    expect(readdirSync(root).sort()).toEqual(["big.wasm.part0", "big.wasm.part1", "big.wasm.part2", "big.wasm.parts.json", "small.wasm"]);
    // A second pass must not touch parts or manifests.
    expect(splitLargeFiles(root, 1000)).toEqual([]);
  });

  it("returns null for a file within the limit", () => {
    root = mkdtempSync(join(tmpdir(), "vendor-split-"));
    writeFileSync(join(root, "ok.bin"), new Uint8Array(10));
    expect(splitFile(join(root, "ok.bin"), 10)).toBeNull();
  });
});
