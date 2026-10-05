import { strokeFromEvent } from "./parse";
import type { CompiledKeybindings } from "./compile";

export function installPageKeybindings(
  target: Window,
  current: () => CompiledKeybindings,
  dispatch: (command: string, args?: unknown) => void,
): () => void {
  const onKeydown = (event: KeyboardEvent) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element || element.closest("input, textarea, select, [contenteditable], .monaco-editor, iframe")) return;
    const stroke = strokeFromEvent(event);
    if (!stroke) return;
    const result = current().resolve("not3.page", stroke, Date.now());
    if (result.kind === "none") return;
    event.preventDefault();
    if (result.kind === "command") dispatch(result.command, result.args);
  };
  target.addEventListener("keydown", onKeydown, true);
  return () => target.removeEventListener("keydown", onKeydown, true);
}
