import { describe, expect, it, vi } from "vitest";
import { compileKeybindings } from "~/lib/keybindings/compile";
import { createDrawKeybindingAdapter } from "~/lib/keybindings/draw-adapter";

function setup(entries: unknown[] = []) {
  const replies: unknown[] = [];
  const frame = { postMessage: (message: unknown) => { replies.push(message); } } as unknown as Window;
  const other = { postMessage: vi.fn() } as unknown as Window;
  const actions: string[] = [];
  const compiled = compileKeybindings(entries);
  const adapter = createDrawKeybindingAdapter(() => frame, () => compiled, (command) => {
    actions.push(command);
    return true;
  });
  const send = (seq: number, key: string, repeat = false, source: MessageEventSource = frame) =>
    adapter.handleMessage(new MessageEvent("message", {
      source,
      data: { type: "not3/draw/keys/1/keydown", payload: { seq, key, repeat } },
    }));
  return { adapter, frame, other, replies, actions, send };
}

describe("draw keybinding adapter", () => {
  it("rejects messages from another window and malformed payloads before dispatch", () => {
    const { adapter, frame, other, replies, actions, send } = setup();
    send(1, "ctrl+s", false, other);
    for (const payload of [null, { seq: 1, key: "ctrl+s" }, { seq: -1, key: "ctrl+s", repeat: false },
      { seq: 0, key: "ctrl+s", repeat: false },
      { seq: 1, key: "ctrl+s ctrl+x", repeat: false }, { seq: 1, key: "Ctrl+S", repeat: false }]) {
      adapter.handleMessage(new MessageEvent("message", {
        source: frame,
        data: { type: "not3/draw/keys/1/keydown", payload },
      }));
    }
    expect(actions).toEqual([]);
    expect(replies).toEqual([]);
  });

  it("dispatches a matched app action once and replies none to the same frame", () => {
    const { send, replies, actions } = setup();
    send(1, "ctrl+s");
    send(1, "ctrl+s");
    expect(actions).toEqual(["not3.save"]);
    expect(replies).toEqual([{ type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "none" } } }]);
  });

  it("returns allowed draw commands, draw.key replay args, and unmatched original strokes", () => {
    const { send, replies } = setup([
      { key: "x", command: "draw.tool.rectangle" },
      { key: "z", command: "draw.key", args: "ctrl+y" },
    ]);
    send(1, "x"); send(2, "z"); send(3, "v");
    expect(replies).toEqual([
      { type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "draw", command: "draw.tool.rectangle" } } },
      { type: "not3/draw/keys/1/reply", payload: { seq: 2, action: { kind: "replay", key: "ctrl+y" } } },
      { type: "not3/draw/keys/1/reply", payload: { seq: 3, action: { kind: "replay", key: "v" } } },
    ]);
  });

  it("uses user override precedence and holds a first chord stroke with immediate ordered replies", () => {
    const { send, replies, actions } = setup([
      { key: "ctrl+s", command: "draw.tool.rectangle" },
      { key: "ctrl+s", command: "draw.tool.ellipse" },
    ]);
    send(1, "ctrl+k"); send(2, "ctrl+s"); send(3, "ctrl+s");
    expect(actions).toEqual(["not3.openKeybindings"]);
    expect(replies).toEqual([
      { type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "none" } } },
      { type: "not3/draw/keys/1/reply", payload: { seq: 2, action: { kind: "none" } } },
      { type: "not3/draw/keys/1/reply", payload: { seq: 3, action: { kind: "draw", command: "draw.tool.ellipse" } } },
    ]);
  });

  it("keeps replies in receive order and changes target with the iframe", () => {
    const first: unknown[] = [];
    const second: unknown[] = [];
    const one = { postMessage: (value: unknown) => { first.push(value); } } as unknown as Window;
    const two = { postMessage: (value: unknown) => { second.push(value); } } as unknown as Window;
    let active = one;
    const adapter = createDrawKeybindingAdapter(() => active, () => compileKeybindings([]), () => true);
    const send = (source: Window, seq: number) => adapter.handleMessage(new MessageEvent("message", {
      source, data: { type: "not3/draw/keys/1/keydown", payload: { seq, key: "v", repeat: false } },
    }));
    send(one, 1);
    active = two;
    send(one, 2);
    send(two, 1);
    expect(first).toEqual([{ type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "replay", key: "v" } } }]);
    expect(second).toEqual([{ type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "replay", key: "v" } } }]);
  });
});
