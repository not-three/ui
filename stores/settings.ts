import { migrateSettings } from "~/lib/settings-migration";
import type { KeybindingEntry } from "~/lib/keybindings/compile";
import type { ThemeId } from "~/lib/theme/registry";

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    version: 4,
    theme: null as ThemeId | null,
    // VS Code keybindings.json entries. Later entries override earlier ones.
    // Prefix a command with "-" to remove its default binding.
    keybindings: [] as KeybindingEntry[],
    cowork: { displayName: '' },
    customServer: {
      url: null as string | null,
      password: null as string | null,
    },
    trustedServers: [] as string[],
    sandbox: {
      panelWidthPct: 50,
    },
    tools: {
      image: { exportFormat: 'webp', exportQuality: 82, checkerboard: true },
      panelWidthPct: 50,
      rememberOptions: true,
      lastOptions: {} as Record<string, Record<string, string | number | boolean>>,
    },
    warnings: {
      serverSideDecryption: true,
      unknownServer: true,
      runCode: true,
    },
    editor: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
      lineNumbers: true,
      renderWhitespace: false,
      stickyScroll: false,
    },
  }),
  persist: {
    afterHydrate: ({ store }) => {
      const migrated = migrateSettings(store.$state);
      // Pinia patches merge nested objects, so remove the legacy field explicitly.
      delete (store.editor as typeof store.editor & { keybindings?: unknown }).keybindings;
      store.$patch(migrated);
    },
  },
})
