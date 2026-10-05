import { DEFAULT_KEYBINDINGS } from "~/lib/keybindings/defaults";
import type { KeybindingEntry } from "~/lib/keybindings/compile";

type SettingsSnapshot = {
  version?: number;
  editor?: { keybindings?: Record<string, string>; [key: string]: unknown };
  keybindings?: KeybindingEntry[];
  [key: string]: unknown;
};

export function migrateSettings<T extends SettingsSnapshot>(settings: T): T {
  if ((settings.version ?? 0) >= 4 && !settings.editor?.keybindings) return settings;
  const old = settings.editor?.keybindings ?? {};
  const { keybindings: _oldBindings, ...editor } = settings.editor ?? {};
  const migrated: KeybindingEntry[] = Object.entries(old).flatMap(([id, key]) => {
    if (typeof key !== "string") return [];
    if (key) return [{ key, command: `not3.${id}` }];
    const defaultKey = DEFAULT_KEYBINDINGS.find((entry) => entry.command === `not3.${id}`)?.key;
    return defaultKey ? [{ key: defaultKey, command: `-not3.${id}` }] : [];
  });
  return {
    ...settings,
    version: 4,
    editor,
    keybindings: [...(Array.isArray(settings.keybindings) ? settings.keybindings : []), ...migrated],
  } as T;
}
