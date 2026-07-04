export const useSettingsStore = defineStore('settings', {
  state: () => ({
    version: 2,
    customServer: {
      url: null as string | null,
      password: null as string | null,
    },
    trustedServers: [] as string[],
    warnings: {
      serverSideDecryption: true,
      unknownServer: true,
    },
    editor: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
      lineNumbers: true,
      renderWhitespace: false,
      stickyScroll: false,
      // action id (see lib/monaco/editor-actions.ts) -> keybinding string.
      // Example: "ctrl+shift+s". Set a value to "" to unbind. Actions without
      // an entry are reachable via the editor command palette (F1).
      keybindings: {
        save: "ctrl+s",
        duplicate: "ctrl+d",
        new: "ctrl+alt+n",
        download: "ctrl+shift+s",
      } as Record<string, string>,
    },
  }),
  persist: true,
})
