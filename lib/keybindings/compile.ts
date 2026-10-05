import { DEFAULT_KEYBINDINGS } from "./defaults";
import { parseChord, type ParsedChord } from "./parse";
import { parseWhen, type KeyContext } from "./when";

export interface KeybindingEntry { key: string; command: string; when?: string; args?: unknown }
export interface InvalidKeybinding { index: number; entry: unknown; reason: string }
export type Resolution = { kind: "none" } | { kind: "pending" } | { kind: "command"; command: string; args?: unknown };
export interface CompiledEntry extends KeybindingEntry { parsed: ParsedChord; contexts: KeyContext[]; source: "default" | "user" }
export interface MonacoRule { keybinding: number; command: string; when?: string; commandArgs?: unknown }

const contexts: KeyContext[] = ["editorTextFocus", "not3.page", "not3.draw"];
export const NOT3_COMMANDS = [
  "save", "saveUntilRead", "saveForCustomTime", "duplicate", "new", "download",
  "format", "shareLink", "shareCurl", "openSettings", "fileTransfer",
  "excalidraw", "sandbox", "openKeybindings", "startCowork",
].map((id) => `not3.${id}`);
const not3Commands = new Set(NOT3_COMMANDS);
const drawTools = new Set(["selection", "rectangle", "diamond", "ellipse", "arrow", "line", "freedraw", "text", "image", "eraser", "hand", "laser", "frame"]);
const drawCommands = new Set(["draw.zoomIn", "draw.zoomOut", "draw.zoomReset", "draw.scrollToContent", "draw.toggleGrid", "draw.toggleTheme", "draw.key"]);

function owner(command: string, monacoCommands: Set<string>): KeyContext[] | null {
  if (not3Commands.has(command)) return contexts;
  if (command.startsWith("draw.tool.") && drawTools.has(command.slice(10))) return ["not3.draw"];
  if (drawCommands.has(command)) return ["not3.draw"];
  // Monaco may hide its format action until a language provider is available.
  if (monacoCommands.has(command) || command === "editor.action.formatDocument") return ["editorTextFocus"];
  return null;
}

export function compileKeybindings(userEntries: unknown, monacoIds: Iterable<string> = []) {
  const monacoCommands = new Set(monacoIds);
  const invalid: InvalidKeybinding[] = [];
  const effective: CompiledEntry[] = [];
  const removals: CompiledEntry[] = [];
  const overrides: CompiledEntry[] = [];
  const pending = new Map<KeyContext, { first: string; at: number }>();

  const compileOne = (entry: unknown, index: number, source: "default" | "user"): CompiledEntry | null => {
    try {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Entry must be an object");
      const value = entry as Record<string, unknown>;
      const parsed = parseChord(value.key);
      if (!parsed) throw new Error("Invalid key");
      if (typeof value.command !== "string" || !value.command) throw new Error("Invalid command");
      const command = value.command.startsWith("-") ? value.command.slice(1) : value.command;
      const available = owner(command, monacoCommands);
      if (!available) throw new Error(`Unknown command: ${command}`);
      const when = parseWhen(value.when);
      if (command === "draw.key" && !parseChord(value.args)) throw new Error("Invalid draw.key args");
      return {
        key: value.key as string,
        command: value.command,
        ...(value.when === undefined ? {} : { when: value.when as string }),
        ...(Object.hasOwn(value, "args") ? { args: value.args } : {}),
        parsed,
        contexts: available.filter(when),
        source,
      };
    } catch (error) {
      if (source === "user") {
        const reason = error instanceof Error ? error.message : String(error);
        invalid.push({ index, entry, reason });
        console.warn(`Skipping keybinding ${index}: ${reason}`, entry);
      }
      return null;
    }
  };

  DEFAULT_KEYBINDINGS.forEach((entry, index) => {
    const compiled = compileOne(entry, index, "default");
    if (compiled) effective.push(compiled);
  });
  if (!Array.isArray(userEntries)) {
    invalid.push({ index: -1, entry: userEntries, reason: "Keybindings must be an array" });
    console.warn("Skipping keybindings: value must be an array", userEntries);
  } else userEntries.forEach((entry, index) => {
    const compiled = compileOne(entry, index, "user");
    if (!compiled) return;
    overrides.push(compiled);
    if (compiled.command.startsWith("-")) {
      removals.push(compiled);
      const command = compiled.command.slice(1);
      for (let i = effective.length - 1; i >= 0; i--) {
        const target = effective[i]!;
        if (target.source !== "default" || target.command !== command || target.parsed.strokes.join(" ") !== compiled.parsed.strokes.join(" ")) continue;
        if (compiled.contexts.some((context) => target.contexts.includes(context))) {
          target.contexts = target.contexts.filter((context) => !compiled.contexts.includes(context));
          if (!target.contexts.length) effective.splice(i, 1);
        }
      }
    } else effective.push(compiled);
  });

  const byContext = Object.fromEntries(contexts.map((context) => [context, effective.filter((entry) => entry.contexts.includes(context))])) as Record<KeyContext, CompiledEntry[]>;
  const resolve = (context: KeyContext, stroke: string, timestamp = Date.now()): Resolution => {
    const normalized = parseChord(stroke);
    if (!normalized || normalized.strokes.length !== 1) return { kind: "none" };
    const key = normalized.strokes[0]!;
    const bindings = byContext[context];
    const held = pending.get(context);
    pending.delete(context);
    if (held && timestamp - held.at <= 1000) {
      const match = bindings.findLast((entry) => entry.parsed.strokes[0] === held.first && entry.parsed.strokes[1] === key);
      if (match) return { kind: "command", command: match.command, ...(match.args === undefined ? {} : { args: match.args }) };
    }
    const match = bindings.findLast((entry) => entry.parsed.strokes[0] === key);
    if (match?.parsed.strokes.length === 2) {
      pending.set(context, { first: key, at: timestamp });
      return { kind: "pending" };
    }
    return match ? { kind: "command", command: match.command, ...(match.args === undefined ? {} : { args: match.args }) } : { kind: "none" };
  };

  const monacoRules: MonacoRule[] = [
    ...effective.filter((entry) => entry.contexts.includes("editorTextFocus") && !entry.command.startsWith("draw.")).map((entry) => ({
      keybinding: entry.parsed.monaco, command: entry.command, when: "editorTextFocus", commandArgs: entry.args,
    })),
    ...removals.filter((entry) => entry.contexts.includes("editorTextFocus")).map((entry) => ({
      // Monaco matches a negative rule's when against the default rule's when.
      // Omitting it removes this command/key across the default's contexts.
      keybinding: entry.parsed.monaco, command: entry.command,
    })),
  ];
  return { invalid, effective, overrides, byContext, monacoRules, resolve };
}

export type CompiledKeybindings = ReturnType<typeof compileKeybindings>;
