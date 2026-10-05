import type { KeybindingEntry } from "./compile";

// User settings hold overrides only; these defaults remain available in every context.
export const DEFAULT_KEYBINDINGS: KeybindingEntry[] = [
  { key: "ctrl+s", command: "not3.save" },
  { key: "ctrl+d", command: "not3.duplicate" },
  { key: "ctrl+alt+n", command: "not3.new" },
  { key: "ctrl+shift+s", command: "not3.download" },
  { key: "shift+alt+f", command: "not3.format" },
  { key: "ctrl+k ctrl+s", command: "not3.openKeybindings" },
  { key: "ctrl+alt+t", command: "not3.tools" },
];
