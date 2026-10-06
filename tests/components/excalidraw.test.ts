import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { onBeforeMount, onBeforeUnmount, onMounted, ref, computed, watch } from "vue";

vi.mock("~/lib/actions", () => ({ SAVE: vi.fn() }));
vi.mock("~/lib/monaco/editor-actions", () => ({ dispatchNot3Action: vi.fn(() => true) }));

for (const [name, value] of Object.entries({ onBeforeMount, onBeforeUnmount, onMounted, ref, computed, watch })) vi.stubGlobal(name, value);

const store = {
  config: { drawURL: "https://draw.example/" }, loading: false, content: "", readonly: false,
  dialog: null, excalidraw: true,
};
vi.stubGlobal("useAppStore", () => store);

const { activeCowork } = await import("~/lib/cowork/active");
const { default: Excalidraw } = await import("~/components/editor/excalidraw.vue");
const Actions = await import("~/lib/actions");
const { dispatchNot3Action } = await import("~/lib/monaco/editor-actions");

function fakeFrame(wrapper: ReturnType<typeof mount>) {
  const frame = wrapper.get("iframe").element as HTMLIFrameElement;
  const target = { postMessage: vi.fn() } as unknown as Window;
  Object.defineProperty(frame, "contentWindow", { configurable: true, value: target });
  return target;
}

afterEach(() => { vi.mocked(Actions.SAVE).mockClear(); vi.mocked(dispatchNot3Action).mockClear(); store.content = ""; store.readonly = false; activeCowork.value = null; });

describe("drawing cowork bridge", () => {
  it("restarts collaboration when the iframe reloads", () => {
    activeCowork.value = { session: {
      kind: "draw", peerId: "alice", participants: [{ peerId: "alice", name: "Alice", color: "#abc", connected: true }],
      onFrame: () => () => {}, onPeer: () => () => {}, send: vi.fn(async () => {}), saveAsNote: vi.fn(),
    }, draw: null, text: null } as never;
    const wrapper = mount(Excalidraw);
    try {
      const target = fakeFrame(wrapper);
      const load = () => window.dispatchEvent(new MessageEvent("message", { source: target, origin: "https://draw.example", data: { type: "not3/draw/load" } }));
      load();
      load();
      const types = vi.mocked(target.postMessage).mock.calls.map(([message]) => (message as { type: string }).type);
      expect(types.filter(type => type === "not3/draw/collab/start")).toHaveLength(2);
      expect(types).toContain("not3/draw/collab/stop");
    } finally { wrapper.unmount(); }
  });

  it("starts after iframe initialization, relays a drawing, and saves a snapshot without leaving", async () => {
    const saveAsNote = vi.fn(async () => {});
    const send = vi.fn(async () => {});
    activeCowork.value = { session: {
      kind: "draw", peerId: "alice", participants: [{ peerId: "alice", name: "Alice", color: "#abc", connected: true }],
      onFrame: () => () => {}, onPeer: () => () => {}, send, saveAsNote,
    }, draw: null, text: null } as never;
    const wrapper = mount(Excalidraw);
    const target = fakeFrame(wrapper);
    const emit = (data: unknown, origin = "https://draw.example") => window.dispatchEvent(new MessageEvent("message", { source: target, origin, data }));
    try {
      emit({ type: "not3/draw/load" });
      expect(target.postMessage).toHaveBeenCalledWith({ type: "not3/draw/collab/start", payload: { self: { id: "alice", name: "Alice", color: "#abc" } } }, "https://draw.example");
      const rect = { id: "rect", version: 1, versionNonce: 2, isDeleted: false, index: "a0" };
      emit({ type: "not3/draw/collab/scene", payload: { elements: [] } });
      emit({ type: "not3/draw/collab/delta", payload: { elements: [rect] } }, "https://other.example");
      expect(send).not.toHaveBeenCalled();
      emit({ type: "not3/draw/collab/delta", payload: { elements: [rect] } });
      expect(store.content).toBe(JSON.stringify({ type: "EXCALIDRAW", data: [rect] }));
      expect(send).toHaveBeenCalledWith(3, expect.any(Uint8Array));
      emit({ type: "not3/draw/save", payload: [rect] });
      expect(saveAsNote).toHaveBeenCalledOnce();
      expect(Actions.SAVE).not.toHaveBeenCalled();
    } finally { wrapper.unmount(); }
    expect(target.postMessage).toHaveBeenLastCalledWith({ type: "not3/draw/collab/stop", payload: {} }, "https://draw.example");
  });
});

describe("draw iframe messages", () => {
  it("enables forwarded keys after load on the exact iframe while preserving scene initialization", () => {
    store.content = JSON.stringify({ type: "EXCALIDRAW", data: [{ id: "shape" }] });
    const wrapper = mount(Excalidraw);
    try {
      const target = fakeFrame(wrapper);
      const post = vi.spyOn(target, "postMessage");
      window.dispatchEvent(new MessageEvent("message", { source: window, origin: "https://draw.example", data: { type: "not3/draw/load" } }));
      expect(post).not.toHaveBeenCalled();
      window.dispatchEvent(new MessageEvent("message", { source: target, origin: "https://draw.example", data: { type: "not3/draw/load" } }));
      expect(post.mock.calls.map(([message]) => message)).toEqual([
        { type: "not3/draw/init", payload: { href: window.location.href, content: [{ id: "shape" }], readonly: false } },
        { type: "not3/draw/keys/1/enable" },
      ]);
    } finally { wrapper.unmount(); }
  });

  it("keeps legacy save and readonly scene handling scoped to the iframe", () => {
    const wrapper = mount(Excalidraw);
    try {
      const target = fakeFrame(wrapper);
      const save = { type: "not3/draw/save", payload: [{ id: "legacy" }] };
      window.dispatchEvent(new MessageEvent("message", { source: window, origin: "https://draw.example", data: save }));
      expect(Actions.SAVE).not.toHaveBeenCalled();
      window.dispatchEvent(new MessageEvent("message", { source: target, origin: "https://draw.example", data: save }));
      expect(store.content).toBe(JSON.stringify({ type: "EXCALIDRAW", data: [{ id: "legacy" }] }));
      expect(Actions.SAVE).toHaveBeenCalledOnce();
      store.readonly = true;
      window.dispatchEvent(new MessageEvent("message", { source: target, origin: "https://draw.example", data: { type: "not3/draw/change", payload: [] } }));
      expect(store.content).toBe(JSON.stringify({ type: "EXCALIDRAW", data: [{ id: "legacy" }] }));
    } finally { wrapper.unmount(); }
  });

  it("does not execute the same forwarded sequence twice after a repeated load message", () => {
    const wrapper = mount(Excalidraw);
    try {
      const target = fakeFrame(wrapper);
      const emit = (data: unknown) => window.dispatchEvent(new MessageEvent("message", { source: target, origin: "https://draw.example", data }));
      const press = { type: "not3/draw/keys/1/keydown", payload: { seq: 1, key: "ctrl+s", repeat: false } };
      emit({ type: "not3/draw/load" });
      emit(press);
      emit({ type: "not3/draw/load" });
      emit(press);
      expect(dispatchNot3Action).toHaveBeenCalledOnce();
      expect(target.postMessage).toHaveBeenCalledWith(
        { type: "not3/draw/keys/1/reply", payload: { seq: 1, action: { kind: "none" } } }, "*",
      );
    } finally { wrapper.unmount(); }
  });
});
