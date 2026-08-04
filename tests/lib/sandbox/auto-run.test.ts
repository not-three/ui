import { describe, expect, it } from "vitest";
import { resolveAutoRun } from "~/lib/sandbox/auto-run";

describe("resolveAutoRun", () => {
  it("defaults to on for light and off for heavy runners", () => {
    const memory = new Map<string, boolean>();
    expect(resolveAutoRun(memory, null, true, { id: "js" })).toBe(true);
    expect(resolveAutoRun(memory, null, true, { id: "py", heavy: true })).toBe(false);
  });

  it("remembers the user's choice per runner across switches", () => {
    const memory = new Map<string, boolean>();
    // user is on python (heavy) and switched auto ON, then flips to js
    expect(resolveAutoRun(memory, "py", true, { id: "js" })).toBe(true);
    // …and back: python must still be ON, not reset to its heavy default
    expect(resolveAutoRun(memory, "js", true, { id: "py", heavy: true })).toBe(true);
  });

  it("survives a detection flicker without losing state", () => {
    const memory = new Map<string, boolean>();
    let auto = resolveAutoRun(memory, null, true, { id: "js" }); // true
    auto = resolveAutoRun(memory, "js", auto, { id: "vue", heavy: true }); // false
    auto = resolveAutoRun(memory, "vue", auto, { id: "js" }); // back
    expect(auto).toBe(true);
  });
});
