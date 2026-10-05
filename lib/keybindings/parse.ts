import { KEY_CODES, KEY_MOD } from "~/lib/monaco/keybindings";

const modifierNames: Record<string, string> = {
  ctrl: "ctrl", cmd: "ctrl", meta: "ctrl", mod: "ctrl",
  shift: "shift", alt: "alt", option: "alt", winctrl: "winctrl",
};
const aliases: Record<string, string> = {
  esc: "escape", del: "delete", " ": "space", spacebar: "space",
  arrowleft: "left", arrowright: "right", arrowup: "up", arrowdown: "down",
};
const order = ["ctrl", "winctrl", "shift", "alt"];
const physicalKeys: Record<string, string> = {
  Semicolon: ";", Equal: "=", Comma: ",", Minus: "-", Period: ".",
  Slash: "/", Backquote: "`", BracketLeft: "[", Backslash: "\\",
  BracketRight: "]", Quote: "'",
};
for (let i = 0; i <= 9; i++) {
  physicalKeys[`Digit${i}`] = String(i);
  physicalKeys[`Numpad${i}`] = `numpad${i}`;
}

export interface ParsedChord { strokes: string[]; monaco: number }

export function parseChord(binding: unknown): ParsedChord | null {
  if (typeof binding !== "string" || !binding.trim()) return null;
  const rawStrokes = binding.trim().split(/\s+/);
  if (rawStrokes.length > 2) return null;
  const strokes: string[] = [];
  const numbers: number[] = [];
  for (const raw of rawStrokes) {
    const tokens = raw.toLowerCase().split("+");
    if (tokens.some((token) => !token)) return null;
    const modifiers = new Set<string>();
    let key: string | null = null;
    for (const token of tokens) {
      const modifier = modifierNames[token];
      if (modifier) {
        if (modifiers.has(modifier)) return null;
        modifiers.add(modifier);
      } else {
        const canonical = aliases[token] ?? token;
        if (key || KEY_CODES[canonical] === undefined) return null;
        key = canonical;
      }
    }
    if (!key) return null;
    strokes.push([...order.filter((name) => modifiers.has(name)), key].join("+"));
    let number = KEY_CODES[key]!;
    if (modifiers.has("ctrl")) number |= KEY_MOD.CtrlCmd;
    if (modifiers.has("winctrl")) number |= KEY_MOD.WinCtrl;
    if (modifiers.has("shift")) number |= KEY_MOD.Shift;
    if (modifiers.has("alt")) number |= KEY_MOD.Alt;
    numbers.push(number);
  }
  return { strokes, monaco: numbers[0]! | ((numbers[1] ?? 0) << 16) };
}

export function strokeFromEvent(event: KeyboardEvent): string | null {
  if (event.isComposing) return null;
  const raw = event.key.toLowerCase();
  if (["control", "meta", "shift", "alt", "altgraph"].includes(raw)) return null;
  const key = physicalKeys[event.code] ?? aliases[raw] ?? raw;
  if (KEY_CODES[key] === undefined) return null;
  const mac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const modifiers = [
    (mac ? event.metaKey : event.ctrlKey) && "ctrl",
    mac && event.ctrlKey && "winctrl",
    event.shiftKey && "shift",
    event.altKey && "alt",
  ].filter(Boolean);
  return [...modifiers, key].join("+");
}
