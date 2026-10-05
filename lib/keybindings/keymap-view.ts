import type { CompiledKeybindings, KeybindingEntry } from "./compile";
import type { KeyContext } from "./when";

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
  return JSON.stringify({
    invalidUserEntries: compiled.invalid,
    effectiveOverrides: compiled.overrides.map(plain),
    not3DefaultsPerContext: Object.fromEntries(contexts.map((context) => [context,
      compiled.byContext[context].filter((entry) => entry.source === "default").map(plain),
    ])),
    monacoCommands: monacoActions.filter((action) => !action.id.startsWith("not3.")).sort((a, b) => a.id.localeCompare(b.id)),
    monacoDefaults: "Monaco uses VS Code default keybindings. See https://code.visualstudio.com/docs/getstarted/keybindings for the reference; Monaco does not expose its default keymap through a public API.",
  }, null, 2);
}
