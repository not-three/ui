import { describe, expect, it } from "vitest";
import {
  CONSOLE_LEVELS,
  SANDBOX_CONSOLE_MESSAGE,
  SANDBOX_READY_MESSAGE,
  parseSandboxMessage,
} from "~/lib/sandbox/protocol";

const TOKEN = "tok-123";

describe("parseSandboxMessage", () => {
  it("accepts a valid console message", () => {
    const msg = parseSandboxMessage(
      { type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level: "warn", args: ["a", "b"] },
      TOKEN,
    );
    expect(msg).toEqual({ type: SANDBOX_CONSOLE_MESSAGE, level: "warn", args: ["a", "b"] });
  });

  it("accepts every console level", () => {
    for (const level of CONSOLE_LEVELS) {
      const msg = parseSandboxMessage(
        { type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level, args: [] },
        TOKEN,
      );
      expect(msg, level).not.toBeNull();
    }
  });

  it("accepts a ready message", () => {
    const msg = parseSandboxMessage({ type: SANDBOX_READY_MESSAGE, token: TOKEN }, TOKEN);
    expect(msg).toEqual({ type: SANDBOX_READY_MESSAGE });
  });

  it("coerces non-string args to strings", () => {
    const msg = parseSandboxMessage(
      { type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level: "log", args: [1, null] },
      TOKEN,
    );
    expect(msg).toEqual({ type: SANDBOX_CONSOLE_MESSAGE, level: "log", args: ["1", "null"] });
  });

  it("rejects a wrong token", () => {
    const msg = parseSandboxMessage(
      { type: SANDBOX_CONSOLE_MESSAGE, token: "evil", level: "log", args: [] },
      TOKEN,
    );
    expect(msg).toBeNull();
  });

  it("rejects unknown types, bad levels, missing args and non-objects", () => {
    expect(parseSandboxMessage({ type: "other", token: TOKEN }, TOKEN)).toBeNull();
    expect(
      parseSandboxMessage({ type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level: "nope", args: [] }, TOKEN),
    ).toBeNull();
    expect(
      parseSandboxMessage({ type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level: "log" }, TOKEN),
    ).toBeNull();
    expect(parseSandboxMessage(null, TOKEN)).toBeNull();
    expect(parseSandboxMessage("string", TOKEN)).toBeNull();
  });
});
