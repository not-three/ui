import { describe, expect, it, vi } from "vitest";
import { debounce } from "~/lib/monaco/utils";

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
