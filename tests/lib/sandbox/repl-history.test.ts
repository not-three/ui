import { describe, expect, it } from "vitest";
import { createReplHistory } from "~/lib/sandbox/repl-history";

describe("REPL history", () => {
  it("moves Up and Down through submitted commands and restores the draft", () => {
    const history = createReplHistory();
    history.record("javascript", "first()");
    history.record("javascript", "second()");
    expect(history.navigate("javascript", "up", "unfinished")).toBe("second()");
    expect(history.navigate("javascript", "up", "second()")).toBe("first()");
    expect(history.navigate("javascript", "up", "first()")).toBe("first()");
    expect(history.navigate("javascript", "down", "first()")).toBe("second()");
    expect(history.navigate("javascript", "down", "second()")).toBe("unfinished");
    expect(history.navigate("javascript", "down", "unfinished")).toBe("unfinished");
  });

  it("retains only the most recent 100 commands", () => {
    const history = createReplHistory();
    for (let i = 0; i < 101; i++) history.record("javascript", `command ${i}`);
    let value = "";
    for (let i = 0; i < 101; i++) value = history.navigate("javascript", "up", value);
    expect(value).toBe("command 1");
  });

  it("keeps runner histories and drafts separate", () => {
    const history = createReplHistory();
    history.record("javascript", "js()");
    history.record("python", "print(1)");
    expect(history.navigate("javascript", "up", "js draft")).toBe("js()");
    expect(history.navigate("python", "up", "py draft")).toBe("print(1)");
    expect(history.navigate("javascript", "down", "js()")).toBe("js draft");
    expect(history.navigate("python", "down", "print(1)")).toBe("py draft");
  });

  it("restores each runner's unsent input when switching engines", () => {
    const history = createReplHistory();
    expect(history.switchRunner("javascript", "python", "const unfinished = 1")).toBe("");
    expect(history.switchRunner("python", "javascript", "print('draft')")).toBe("const unfinished = 1");
    expect(history.switchRunner("javascript", "python", "const unfinished = 1")).toBe("print('draft')");
  });

  it("resets navigation on submit while preserving earlier commands", () => {
    const history = createReplHistory();
    history.record("javascript", "one");
    history.navigate("javascript", "up", "draft");
    history.record("javascript", "two");
    expect(history.navigate("javascript", "up", "new draft")).toBe("two");
    expect(history.navigate("javascript", "down", "two")).toBe("new draft");
  });
});
