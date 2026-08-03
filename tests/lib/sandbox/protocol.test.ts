import { describe, expect, it } from "vitest";
import {
  CONSOLE_LEVELS,
  SANDBOX_CONSOLE_MESSAGE,
  SANDBOX_READY_MESSAGE,
  parseSandboxMessage,
  sanitizeConsoleCss,
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

  it("keeps styled segments and sanitizes their css", () => {
    const msg = parseSandboxMessage(
      {
        type: SANDBOX_CONSOLE_MESSAGE,
        token: TOKEN,
        level: "log",
        args: ["red big"],
        segments: [
          { text: "red ", css: "color: red; position: fixed" },
          { text: "big", css: "font-size: 20px" },
        ],
      },
      TOKEN,
    );
    expect(msg).toEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      level: "log",
      args: ["red big"],
      segments: [
        { text: "red ", css: "color: red" },
        { text: "big", css: "font-size: 20px" },
      ],
    });
  });

  it("drops malformed segment lists", () => {
    const base = { type: SANDBOX_CONSOLE_MESSAGE, token: TOKEN, level: "log", args: ["x"] };
    expect(parseSandboxMessage({ ...base, segments: "nope" }, TOKEN)).toEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      level: "log",
      args: ["x"],
    });
    expect(parseSandboxMessage({ ...base, segments: [] }, TOKEN)).toEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      level: "log",
      args: ["x"],
    });
    expect(parseSandboxMessage({ ...base, segments: [null, 1] }, TOKEN)).toEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      level: "log",
      args: ["x"],
      segments: [
        { text: "null", css: "" },
        { text: "1", css: "" },
      ],
    });
  });
});

describe("sanitizeConsoleCss", () => {
  it("keeps common text styling declarations", () => {
    expect(sanitizeConsoleCss("color:#f00;font-weight:bold")).toBe(
      "color: #f00; font-weight: bold",
    );
    expect(sanitizeConsoleCss("background: linear-gradient(90deg, red, blue)")).toBe(
      "background: linear-gradient(90deg, red, blue)",
    );
    expect(sanitizeConsoleCss("PADDING: 2px 4px")).toBe("padding: 2px 4px");
  });

  it("drops properties that could escape or cover the console pane", () => {
    expect(sanitizeConsoleCss("position: fixed; top: 0; z-index: 99")).toBe("");
    expect(sanitizeConsoleCss("width: 100vw; height: 100vh; transform: scale(9)")).toBe("");
    expect(sanitizeConsoleCss("animation: x 1s; content: 'x'")).toBe("");
  });

  it("drops values that could load resources or break out of the attribute", () => {
    expect(sanitizeConsoleCss("background: url(https://evil.example/x.png)")).toBe("");
    expect(sanitizeConsoleCss("background-image: image-set('a.png' 1x)")).toBe("");
    expect(sanitizeConsoleCss("color: red } body {")).toBe("");
    expect(sanitizeConsoleCss("color: expression(alert(1))")).toBe("");
    expect(sanitizeConsoleCss("background: \\75 rl(x)")).toBe("");
  });

  it("ignores junk and oversized input", () => {
    expect(sanitizeConsoleCss("")).toBe("");
    expect(sanitizeConsoleCss("not-a-declaration")).toBe("");
    expect(sanitizeConsoleCss("color:")).toBe("");
    expect(sanitizeConsoleCss("color: red".padEnd(5000, " "))).toBe("");
  });
});
