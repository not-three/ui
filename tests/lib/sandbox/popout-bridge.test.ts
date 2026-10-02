import { describe, expect, it } from "vitest";
import {
  POPOUT_READY_MESSAGE,
  POPOUT_STATE_MESSAGE,
  parsePopoutMessage,
} from "~/lib/sandbox/popout-bridge";

describe("parsePopoutMessage", () => {
  it("accepts a ready message", () => {
    expect(parsePopoutMessage({ type: POPOUT_READY_MESSAGE })).toEqual({
      type: POPOUT_READY_MESSAGE,
    });
  });

  it("accepts a state message and coerces nothing", () => {
    const msg = parsePopoutMessage({
      type: POPOUT_STATE_MESSAGE,
      content: "x",
      languageId: "sql",
    });
    expect(msg).toEqual({ type: POPOUT_STATE_MESSAGE, content: "x", languageId: "sql" });
  });

  it("rejects wrong shapes", () => {
    expect(parsePopoutMessage(null)).toBeNull();
    expect(
      parsePopoutMessage({ type: POPOUT_STATE_MESSAGE, content: 1, languageId: "sql" }),
    ).toBeNull();
    expect(parsePopoutMessage({ type: "other" })).toBeNull();
  });
});
