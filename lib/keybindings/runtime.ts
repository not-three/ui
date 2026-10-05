import { compileKeybindings, type CompiledKeybindings } from "./compile";
import { buildKeymapView } from "./keymap-view";

let entries: unknown = [];
let actions: { id: string; label: string }[] = [];
let ready = false;
let compiled = compileKeybindings([]);
const listeners = new Set<(value: CompiledKeybindings) => void>();

function refresh() {
  if (!ready) return;
  compiled = compileKeybindings(entries, actions.map((action) => action.id));
  listeners.forEach((listener) => listener(compiled));
}

export function setUserKeybindings(value: unknown) {
  entries = value;
  refresh();
}

export function setMonacoActions(value: { id: string; label: string }[]) {
  actions = value;
  ready = true;
  refresh();
}

export function getKeybindingResolver(): CompiledKeybindings { return compiled; }
export function getKeymapView(): string { return buildKeymapView(compiled, actions); }
export function subscribeKeybindings(listener: (value: CompiledKeybindings) => void): () => void {
  listeners.add(listener);
  listener(compiled);
  return () => listeners.delete(listener);
}
