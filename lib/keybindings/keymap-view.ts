import type { CompiledKeybindings, KeybindingEntry } from "./compile";
import type { KeyContext } from "./when";
import { DEFAULT_KEYBINDINGS } from "./defaults";
import { parseChord } from "./parse";

export function buildKeymapView(
  compiled: CompiledKeybindings,
  monacoActions: { id: string; label: string }[],
): string {
  const plain = (entry: KeybindingEntry): KeybindingEntry => ({
    key: entry.key, command: entry.command,
    ...(entry.when === undefined ? {} : { when: entry.when }),
    ...(entry.args === undefined ? {} : { args: entry.args }),
  });
  const contexts: KeyContext[] = ["editorTextFocus", "not3.page", "not3.draw"];
  const effectiveOverrides = compiled.overrides.flatMap((entry) => {
    const effectiveContexts = entry.contexts.filter((context) => {
      if (entry.command.startsWith("-")) {
        const command = entry.command.slice(1);
        if (!command.startsWith("not3.")) return context === "editorTextFocus";
        return DEFAULT_KEYBINDINGS.some((defaultEntry) =>
          defaultEntry.command === command
          && parseChord(defaultEntry.key)?.strokes.join(" ") === entry.parsed.strokes.join(" "));
      }
      const bindings = compiled.byContext[context];
      const prefix = entry.parsed.strokes[0];
      if (entry.parsed.strokes.length === 1) {
        return bindings.findLast((binding) => binding.parsed.strokes[0] === prefix) === entry;
      }
      const index = bindings.indexOf(entry);
      return bindings.findLast((binding) => binding.parsed.strokes.join(" ") === entry.parsed.strokes.join(" ")) === entry
        && !bindings.slice(index + 1).some((binding) => binding.parsed.strokes[0] === prefix && binding.parsed.strokes.length === 1);
    });
    return effectiveContexts.length ? [{ ...plain(entry), effectiveContexts }] : [];
  });
  return JSON.stringify({
    invalidUserEntries: compiled.invalid,
    effectiveOverrides,
    not3DefaultsPerContext: Object.fromEntries(contexts.map((context) => [context,
      compiled.byContext[context].filter((entry) => entry.source === "default").map(plain),
    ])),
    monacoCommands: monacoActions.filter((action) => !action.id.startsWith("not3.")).sort((a, b) => a.id.localeCompare(b.id)),
    monacoDefaults: "Monaco uses VS Code default keybindings. See https://code.visualstudio.com/docs/getstarted/keybindings for the reference; Monaco does not expose its default keymap through a public API.",
    formatBindings: "Shift+Alt+F can invoke both not3.format and Monaco's editor.action.formatDocument. Use -not3.format to remove the !3 formatter binding; -editor.action.formatDocument removes only Monaco's built-in binding.",
  }, null, 2);
}
