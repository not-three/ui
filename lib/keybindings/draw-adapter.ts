import type { CompiledKeybindings } from "./compile";
import { parseChord } from "./parse";

type DrawReply =
  | { kind: "none" }
  | { kind: "replay"; key: string }
  | { kind: "draw"; command: string; args?: unknown };

function forwardedPress(value: unknown): value is { seq: number; key: string; repeat: boolean } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const press = value as Record<string, unknown>;
  if (!Number.isSafeInteger(press.seq) || (press.seq as number) < 1 || typeof press.repeat !== "boolean") return false;
  const parsed = parseChord(press.key);
  return !!parsed && parsed.strokes.length === 1 && parsed.strokes[0] === press.key;
}

export function createDrawKeybindingAdapter(
  iframeWindow: () => Window | null | undefined,
  resolver: () => CompiledKeybindings,
  dispatch: (command: string) => boolean,
) {
  let lastWindow: Window | null | undefined;
  let lastSeq = -1;
  return {
    reset() { lastWindow = iframeWindow(); lastSeq = -1; },
    handleMessage(event: MessageEvent): boolean {
      const target = iframeWindow();
      if (!target || event.source !== target || !event.data || typeof event.data !== "object") return false;
      if (event.data.type !== "not3/draw/keys/1/keydown" || !forwardedPress(event.data.payload)) return false;
      const { seq, key } = event.data.payload;
      if (target !== lastWindow) { lastWindow = target; lastSeq = -1; }
      if (seq <= lastSeq) return false;
      lastSeq = seq;

      const result = resolver().resolve("not3.draw", key, Date.now());
      let action: DrawReply;
      if (result.kind === "pending" || (result.kind === "command" && result.command.startsWith("not3."))) {
        action = { kind: "none" };
      } else if (result.kind === "command" && result.command === "draw.key" && typeof result.args === "string") {
        action = { kind: "replay", key: result.args };
      } else if (result.kind === "command" && result.command.startsWith("draw.")) {
        action = { kind: "draw", command: result.command, ...(result.args === undefined ? {} : { args: result.args }) };
      } else {
        action = { kind: "replay", key };
      }
      target.postMessage({ type: "not3/draw/keys/1/reply", payload: { seq, action } }, "*");
      if (result.kind === "command" && result.command.startsWith("not3.")) dispatch(result.command);
      return true;
    },
  };
}
