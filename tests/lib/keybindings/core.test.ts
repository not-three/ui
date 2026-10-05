import { describe, expect, it, vi } from "vitest";
import { parseChord, strokeFromEvent } from "~/lib/keybindings/parse";
import { evaluateWhen } from "~/lib/keybindings/when";
import { compileKeybindings } from "~/lib/keybindings/compile";
import { installPageKeybindings } from "~/lib/keybindings/page-adapter";
import { createMonacoKeybindingAdapter } from "~/lib/monaco/keybindings-adapter";
import { buildKeymapView } from "~/lib/keybindings/keymap-view";

describe("keybinding parser", () => {
  it("normalizes platform modifiers and compiles two strokes", () => {
    const parsed = parseChord("CMD+K ctrl+s");
    expect(parsed?.strokes).toEqual(["ctrl+k", "ctrl+s"]);
    expect(parsed?.monaco).toBe((2048 | 41) | ((2048 | 49) << 16));
    expect(parseChord("winctrl+pageup")?.strokes).toEqual(["winctrl+pageup"]);
    expect(parseChord("numpad0")?.strokes).toEqual(["numpad0"]);
    expect(parseChord("f24")?.strokes).toEqual(["f24"]);
  });

  it("rejects malformed and modifier-only strokes", () => {
    expect(parseChord("ctrl+")).toBeNull();
    expect(parseChord("ctrl+shift")).toBeNull();
    expect(parseChord("ctrl+a+b")).toBeNull();
    expect(parseChord("ctrl+k ctrl+s ctrl+p")).toBeNull();
    expect(strokeFromEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }))).toBeNull();
  });

  it("uses physical codes for numpad and shifted punctuation", () => {
    expect(strokeFromEvent(new KeyboardEvent("keydown", { key: "0", code: "Numpad0" }))).toBe("numpad0");
    expect(strokeFromEvent(new KeyboardEvent("keydown", { key: ":", code: "Semicolon", shiftKey: true }))).toBe("shift+;");
    expect(strokeFromEvent(new KeyboardEvent("keydown", { key: "!", code: "Digit1", shiftKey: true }))).toBe("shift+1");
  });
});

describe("when clauses", () => {
  it("evaluates negation, conjunction and disjunction in context", () => {
    expect(evaluateWhen("editorTextFocus || not3.draw && !not3.page", "not3.draw")).toBe(true);
    expect(evaluateWhen("editorTextFocus && !not3.draw", "not3.page")).toBe(false);
    expect(evaluateWhen("!editorTextFocus", "not3.page")).toBe(true);
  });

  it("rejects unsupported and malformed clauses", () => {
    expect(() => evaluateWhen("foo.bar", "not3.page")).toThrow();
    expect(() => evaluateWhen("not3.page &&", "not3.page")).toThrow();
  });
});

describe("compiled keybindings", () => {
  it("skips an invalid middle entry while later valid entries still apply", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const compiled = compileKeybindings([
      { key: "alt+s", command: "not3.save" },
      { key: "ctrl+bogus", command: "not3.save" },
      { key: "alt+d", command: "not3.duplicate" },
    ]);
    expect(compiled.invalid).toHaveLength(1);
    expect(compiled.invalid[0]?.reason).toMatch(/key/i);
    expect(compiled.resolve("not3.page", "alt+s", 0)).toMatchObject({ kind: "command", command: "not3.save" });
    expect(compiled.resolve("not3.page", "alt+d", 1)).toMatchObject({ kind: "command", command: "not3.duplicate" });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("applies later rules and removes default bindings by command and key", () => {
    const compiled = compileKeybindings([
      { key: "ctrl+s", command: "-not3.save" },
      { key: "ctrl+s", command: "not3.duplicate" },
      { key: "ctrl+s", command: "not3.new", when: "not3.page" },
    ]);
    expect(compiled.resolve("not3.page", "ctrl+s", 0)).toMatchObject({ kind: "command", command: "not3.new" });
    expect(compiled.resolve("not3.draw", "ctrl+s", 0)).toMatchObject({ kind: "command", command: "not3.duplicate" });
  });

  it("holds a first chord stroke for one second per context", () => {
    const compiled = compileKeybindings([]);
    expect(compiled.resolve("not3.page", "ctrl+k", 0)).toEqual({ kind: "pending" });
    expect(compiled.resolve("not3.page", "ctrl+s", 500)).toMatchObject({ kind: "command", command: "not3.openKeybindings" });
    expect(compiled.resolve("not3.draw", "ctrl+k", 600)).toEqual({ kind: "pending" });
    expect(compiled.resolve("not3.page", "ctrl+k", 1000)).toEqual({ kind: "pending" });
    expect(compiled.resolve("not3.page", "ctrl+s", 2001)).toMatchObject({ kind: "command", command: "not3.save" });
  });

  it("lets a later single stroke override an earlier chord prefix", () => {
    const compiled = compileKeybindings([{ key: "ctrl+k", command: "not3.save" }]);
    expect(compiled.resolve("not3.page", "ctrl+k", 0)).toMatchObject({ kind: "command", command: "not3.save" });
    const laterChord = compileKeybindings([{ key: "ctrl+s ctrl+x", command: "not3.new" }]);
    expect(laterChord.resolve("not3.page", "ctrl+s", 0)).toEqual({ kind: "pending" });
  });

  it("validates Monaco commands and draw key arguments independently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const compiled = compileKeybindings([
      { key: "alt+f", command: "editor.action.formatDocument" },
      { key: "x", command: "draw.key", args: "ctrl+z" },
      { key: "y", command: "draw.key", args: "invalid" },
      { key: "z", command: "unknown.command" },
    ], ["editor.action.formatDocument"]);
    expect(compiled.invalid).toHaveLength(2);
    expect(compiled.resolve("editorTextFocus", "alt+f", 0)).toMatchObject({ kind: "command", command: "editor.action.formatDocument" });
    expect(compiled.resolve("not3.draw", "x", 0)).toMatchObject({ kind: "command", command: "draw.key", args: "ctrl+z" });
    expect(compiled.resolve("not3.page", "x", 0)).toEqual({ kind: "none" });
    warn.mockRestore();
  });

  it("allows removing Monaco's format default before a formatter is available", () => {
    const compiled = compileKeybindings([{ key: "shift+alt+f", command: "-editor.action.formatDocument" }]);
    expect(compiled.invalid).toEqual([]);
    expect(compiled.monacoRules).toContainEqual({ keybinding: 1572, command: "-editor.action.formatDocument" });
  });

  it("removes only the named format command", () => {
    const monacoRemoval = compileKeybindings([{ key: "shift+alt+f", command: "-editor.action.formatDocument" }]);
    expect(monacoRemoval.resolve("editorTextFocus", "shift+alt+f", 0)).toMatchObject({ kind: "command", command: "not3.format" });
    const appRemoval = compileKeybindings([{ key: "shift+alt+f", command: "-not3.format" }]);
    expect(appRemoval.resolve("editorTextFocus", "shift+alt+f", 0)).toEqual({ kind: "none" });
    expect(appRemoval.monacoRules).toContainEqual({ keybinding: 1572, command: "-not3.format" });
  });
});

describe("page adapter", () => {
  it("only prevents matched keys outside form controls and Monaco", () => {
    const commands: string[] = [];
    const teardown = installPageKeybindings(window, () => compileKeybindings([]), (command) => commands.push(command));
    const title = document.createElement("div");
    const input = document.createElement("input");
    const monaco = document.createElement("div");
    monaco.className = "monaco-editor";
    document.body.append(title, input, monaco);
    const fire = (target: Element, key: string, ctrlKey = true) => {
      const event = new KeyboardEvent("keydown", { key, ctrlKey, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(fire(input, "s")).toBe(false);
    expect(fire(monaco, "s")).toBe(false);
    expect(fire(title, "x")).toBe(false);
    expect(fire(title, "s")).toBe(true);
    expect(commands).toEqual(["not3.save"]);
    teardown();
    title.remove(); input.remove(); monaco.remove();
  });

  it("dispatches numpad and shifted punctuation bindings from page content", () => {
    const commands: string[] = [];
    const compiled = compileKeybindings([
      { key: "numpad0", command: "not3.save" },
      { key: "shift+;", command: "not3.new" },
    ]);
    const teardown = installPageKeybindings(window, () => compiled, (command) => commands.push(command));
    const title = document.createElement("div");
    document.body.append(title);
    const numpad = new KeyboardEvent("keydown", { key: "0", code: "Numpad0", bubbles: true, cancelable: true });
    const punctuation = new KeyboardEvent("keydown", { key: ":", code: "Semicolon", shiftKey: true, bubbles: true, cancelable: true });
    title.dispatchEvent(numpad);
    title.dispatchEvent(punctuation);
    expect(numpad.defaultPrevented).toBe(true);
    expect(punctuation.defaultPrevented).toBe(true);
    expect(commands).toEqual(["not3.save", "not3.new"]);
    teardown();
    title.remove();
  });
});

describe("Monaco adapter", () => {
  it("replaces the previous rule set when a setting changes", () => {
    const active = new Set<string>();
    const adapter = createMonacoKeybindingAdapter((rules) => {
      const ids = rules.map((rule) => `${rule.command}:${rule.keybinding}`);
      ids.forEach((id) => active.add(id));
      return { dispose: () => ids.forEach((id) => active.delete(id)) };
    });
    adapter.apply(compileKeybindings([{ key: "alt+s", command: "not3.save" }]));
    expect([...active]).toContain("not3.save:561");
    adapter.apply(compileKeybindings([{ key: "alt+x", command: "not3.save" }]));
    expect([...active]).toContain("not3.save:566");
    expect([...active]).not.toContain("not3.save:561");
    adapter.dispose();
    expect(active.size).toBe(0);
  });
});

describe("keymap view", () => {
  it("shows invalid entries, overrides, defaults and available Monaco actions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const compiled = compileKeybindings([{ key: "bogus", command: "not3.save" }, { key: "alt+s", command: "not3.save" }]);
    const view = JSON.parse(buildKeymapView(compiled, [{ id: "actions.find", label: "Find" }]));
    expect(view.invalidUserEntries[0].reason).toMatch(/key/i);
    expect(view.effectiveOverrides).toContainEqual({ key: "alt+s", command: "not3.save" });
    expect(view.not3DefaultsPerContext["not3.page"]).toContainEqual({ key: "ctrl+s", command: "not3.save" });
    expect(view.monacoCommands).toContainEqual({ id: "actions.find", label: "Find" });
    expect(view.monacoDefaults).toContain("https://code.visualstudio.com/docs/getstarted/keybindings");
    expect(view.formatBindings).toContain("-not3.format");
    expect(view.formatBindings).toContain("-editor.action.formatDocument");
    warn.mockRestore();
  });
});
