type SettingsSnapshot = {
  version?: number;
  editor?: { keybindings?: Record<string, string>; [key: string]: unknown };
  [key: string]: unknown;
};

export function migrateSettings<T extends SettingsSnapshot>(settings: T): T {
  if ((settings.version ?? 0) >= 3) return settings;
  return {
    ...settings,
    version: 3,
    editor: {
      ...settings.editor,
      keybindings: {
        ...settings.editor?.keybindings,
        format: settings.editor?.keybindings?.format ?? "shift+alt+f",
      },
    },
  } as T;
}
