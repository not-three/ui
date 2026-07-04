import { describe, expect, it } from "vitest";
import { KEY_MOD, parseKeybinding } from "~/lib/monaco/keybindings";

// monaco KeyCode values: KeyS=49, KeyN=44, F5=63, Enter=3, Digit1=22
describe("parseKeybinding", () => {
  it("parses a single modifier + letter", () => {
    expect(parseKeybinding("ctrl+s")).toBe(KEY_MOD.CtrlCmd | 49);
  });

  it("parses multiple modifiers", () => {
    expect(parseKeybinding("ctrl+shift+s")).toBe(
      KEY_MOD.CtrlCmd | KEY_MOD.Shift | 49,
    );
    expect(parseKeybinding("ctrl+alt+n")).toBe(
      KEY_MOD.CtrlCmd | KEY_MOD.Alt | 44,
    );
  });

  it("is case- and whitespace-insensitive", () => {
    expect(parseKeybinding(" Ctrl + Shift + S ")).toBe(
      KEY_MOD.CtrlCmd | KEY_MOD.Shift | 49,
    );
  });

  it("parses bare keys, digits and function keys", () => {
    expect(parseKeybinding("f5")).toBe(63);
    expect(parseKeybinding("ctrl+1")).toBe(KEY_MOD.CtrlCmd | 22);
    expect(parseKeybinding("shift+enter")).toBe(KEY_MOD.Shift | 3);
  });

  it("treats cmd/meta/mod as CtrlCmd", () => {
    expect(parseKeybinding("cmd+s")).toBe(KEY_MOD.CtrlCmd | 49);
    expect(parseKeybinding("meta+s")).toBe(KEY_MOD.CtrlCmd | 49);
    expect(parseKeybinding("mod+s")).toBe(KEY_MOD.CtrlCmd | 49);
  });

  it("rejects invalid bindings", () => {
    expect(parseKeybinding(null)).toBeNull();
    expect(parseKeybinding(undefined)).toBeNull();
    expect(parseKeybinding("")).toBeNull();
    expect(parseKeybinding("ctrl+")).toBeNull(); // modifiers only
    expect(parseKeybinding("ctrl+foo")).toBeNull(); // unknown key
    expect(parseKeybinding("ctrl+s+d")).toBeNull(); // two keys
  });
});
