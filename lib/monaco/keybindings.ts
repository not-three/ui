// Numeric values mirror monaco's KeyMod/KeyCode enums. They are frozen for
// backwards compatibility (VS Code serializes keybindings with them), and are
// duplicated here so this module is unit-testable without importing the full
// monaco-editor bundle. Verified against monaco-editor 0.55.1 editor.api.d.ts.
export const KEY_MOD = {
  CtrlCmd: 2048,
  Shift: 1024,
  Alt: 512,
  WinCtrl: 256,
} as const;

const KEY_CODES: Record<string, number> = {
  backspace: 1,
  tab: 2,
  enter: 3,
  escape: 9,
  esc: 9,
  space: 10,
  pageup: 11,
  pagedown: 12,
  end: 13,
  home: 14,
  left: 15,
  up: 16,
  right: 17,
  down: 18,
  insert: 19,
  delete: 20,
  del: 20,
  ";": 85,
  "=": 86,
  ",": 87,
  "-": 88,
  ".": 89,
  "/": 90,
  "`": 91,
  "[": 92,
  "\\": 93,
  "]": 94,
  "'": 95,
};
for (let i = 0; i <= 9; i++) KEY_CODES[String(i)] = 21 + i; // Digit0-9
for (let i = 0; i < 26; i++) KEY_CODES[String.fromCharCode(97 + i)] = 31 + i; // KeyA-Z
for (let i = 1; i <= 24; i++) KEY_CODES[`f${i}`] = 58 + i; // F1-F24

const MODIFIERS: Record<string, number> = {
  ctrl: KEY_MOD.CtrlCmd,
  cmd: KEY_MOD.CtrlCmd,
  meta: KEY_MOD.CtrlCmd,
  mod: KEY_MOD.CtrlCmd,
  shift: KEY_MOD.Shift,
  alt: KEY_MOD.Alt,
  option: KEY_MOD.Alt,
  winctrl: KEY_MOD.WinCtrl,
};

/**
 * Parse a keybinding string like "ctrl+shift+s" into a monaco keybinding
 * number, or null if the string is empty/invalid (= leave the action unbound).
 */
export function parseKeybinding(
  binding: string | null | undefined,
): number | null {
  if (!binding) return null;
  const tokens = binding
    .split("+")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return null;
  let mods = 0;
  let key: number | null = null;
  for (const token of tokens) {
    const mod = MODIFIERS[token];
    if (mod !== undefined) {
      mods |= mod;
      continue;
    }
    if (key !== null) return null; // more than one non-modifier key
    const code = KEY_CODES[token];
    if (code === undefined) return null; // unknown key
    key = code;
  }
  if (key === null) return null; // modifiers only
  return mods | key;
}
