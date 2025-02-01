export const useSettingsStore = defineStore('settings', {
  state: () => ({
    version: 1,
    customServer: {
      url: null as string | null,
      password: null as string | null,
    },
    trustedServers: [] as string[],
    warnings: {
      serverSideDecryption: true,
      unknownServer: true,
    }
  }),
  persist: true,
})
