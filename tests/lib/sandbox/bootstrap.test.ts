import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBootstrap } from "~/lib/sandbox/bootstrap";
import {
  SANDBOX_CONSOLE_MESSAGE,
  SANDBOX_EVAL_MESSAGE,
  SANDBOX_READY_MESSAGE,
} from "~/lib/sandbox/protocol";

const TOKEN = "tok-abc";

// In happy-dom window.parent === window, so spying on window.postMessage
// captures everything the bootstrap sends "to the parent".
function setup(token = TOKEN) {
  const posted: unknown[] = [];
  vi.spyOn(window, "postMessage").mockImplementation(((msg: unknown) => {
    posted.push(msg);
  }) as typeof window.postMessage);
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, level).mockImplementation(() => {});
  }
  vi.spyOn(console, "clear").mockImplementation(() => {});
  new Function(buildBootstrap(token))();
  return posted;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildBootstrap", () => {
  it("posts a ready message on startup", () => {
    const posted = setup();
    expect(posted).toContainEqual({ type: SANDBOX_READY_MESSAGE, token: TOKEN });
  });

  it("relays console calls with serialized arguments", () => {
    const posted = setup();
    console.log("hello", { a: 1 });
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["hello", "{a: 1}"],
    });
  });

  it("serializes special values", () => {
    const posted = setup();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    console.log(circular);
    console.warn(undefined, null, 10n, function foo() {});
    console.info([1, "two", [3]]);
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["{self: [Circular]}"],
    });
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "warn",
      args: ["undefined", "null", "10n", "[Function: foo]"],
    });
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "info",
      args: ['[1, "two", [3]]'],
    });
  });

  it("relays console.clear", () => {
    const posted = setup();
    console.clear();
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "clear",
      args: [],
    });
  });

  it("evaluates code sent with the correct token", () => {
    const posted = setup();
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: SANDBOX_EVAL_MESSAGE, token: TOKEN, code: "1 + 2" },
        source: window,
      }),
    );
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["3"],
    });
  });

  // Runners with their own interpreter (sql, python) install __not3Eval__ so
  // the console input speaks their language instead of JavaScript.
  it("routes eval requests through window.__not3Eval__ when a runner installed one", async () => {
    const posted = setup();
    (window as unknown as Record<string, unknown>).__not3Eval__ = (code: string) =>
      "SQL:" + code;
    try {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: SANDBOX_EVAL_MESSAGE, token: TOKEN, code: "select 1" },
          source: window,
        }),
      );
      await new Promise((r) => setTimeout(r, 0));
      expect(posted).toContainEqual(
        expect.objectContaining({
          type: SANDBOX_CONSOLE_MESSAGE,
          level: "log",
          args: ["SQL:select 1"],
        }),
      );
    } finally {
      delete (window as unknown as Record<string, unknown>).__not3Eval__;
    }
  });

  it("reports a rejecting __not3Eval__ hook as a console error", async () => {
    const posted = setup();
    (window as unknown as Record<string, unknown>).__not3Eval__ = () => {
      throw new Error("no such table: t");
    };
    try {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: SANDBOX_EVAL_MESSAGE, token: TOKEN, code: "select * from t" },
          source: window,
        }),
      );
      await new Promise((r) => setTimeout(r, 0));
      expect(posted).toContainEqual(
        expect.objectContaining({
          level: "error",
          args: [expect.stringContaining("no such table: t")],
        }),
      );
    } finally {
      delete (window as unknown as Record<string, unknown>).__not3Eval__;
    }
  });

  it("splits %c format strings into styled segments", () => {
    const posted = setup();
    console.log("%cred%c plain", "color: red", "", "tail");
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["red plain tail"],
      segments: [
        { text: "", css: "" },
        { text: "red", css: "color: red" },
        { text: " plain", css: "" },
        { text: " tail", css: "" },
      ],
    });
  });

  it("substitutes non-style format directives", () => {
    const posted = setup();
    console.log("%s is %d/%f %o %% %q", "x", 4.7, 1.5, { a: 1 });
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["x is 4/1.5 {a: 1} % %q"],
    });
  });

  it("leaves plain strings and unmatched directives alone", () => {
    const posted = setup();
    console.log("100% sure", { a: 1 });
    console.log("%c");
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["100% sure", "{a: 1}"],
    });
    expect(posted).toContainEqual({
      type: SANDBOX_CONSOLE_MESSAGE,
      token: TOKEN,
      level: "log",
      args: ["%c"],
    });
  });

  it("ignores eval requests with a wrong token", () => {
    const posted = setup();
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: SANDBOX_EVAL_MESSAGE, token: "evil", code: "40 + 2" },
        source: window,
      }),
    );
    expect(posted).not.toContainEqual(
      expect.objectContaining({ args: ["42"] }),
    );
  });
});
