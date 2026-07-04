import { describe, expect, it, vi } from "vitest";
import { debounce, detectLanguageFromContent } from "~/lib/monaco/utils";

describe("debounce", () => {
  it("only invokes the last call after the wait time", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced(1);
    debounced(2);
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
    vi.useRealTimers();
  });
});

describe("detectLanguageFromContent", () => {
  it("returns plaintext for empty content", () => {
    expect(detectLanguageFromContent("   \n  ")).toBe("plaintext");
  });

  it("detects json", () => {
    expect(
      detectLanguageFromContent('{\n  "name": "test",\n  "value": 42\n}'),
    ).toBe("json");
  });

  it("detects yaml with matches beyond the first line", () => {
    const yaml = [
      "services:",
      "  web:",
      "    image: nginx",
      "    ports:",
      "      - target: 80",
    ].join("\n");
    expect(detectLanguageFromContent(yaml)).toBe("yaml");
  });

  it("detects shell from a shebang plus body", () => {
    const sh = ["#!/bin/bash", 'if [ -z "$1" ]; then', "  exit 1", "fi"].join(
      "\n",
    );
    expect(detectLanguageFromContent(sh)).toBe("shell");
  });

  it("detects typescript", () => {
    const ts = [
      'import { foo } from "./foo";',
      "interface Bar { baz: string; }",
      "const x: number = 1;",
    ].join("\n");
    expect(detectLanguageFromContent(ts)).toBe("typescript");
  });
});
