import type { InfoResponse, Not3Client } from "@not3/sdk"
import { AxiosError } from "axios"
import { OkDialog, TextOutputDialog, YesNoDialog, type Dialog } from "~/lib/dialog"
import { createNoteSnapshot } from '~/lib/cowork/snapshot'
import { languageDefinitions } from "~/lib/monaco/languages"
import type { LanguageDefinition } from "~/lib/monaco/types"
import { migrateSettings } from "~/lib/settings-migration"

// SDK 2.1.0 reads this field in P2PClient.isEnabled(), but its generated
// InfoResponse predates the API's /info addition.
type UiInfoResponse = InfoResponse & { p2pEnabled?: boolean; p2pRooms?: boolean }

type UiConfig = {
  baseURL: string
  drawURL?: string
  termsURL?: string
  pullRequest?: string
  theme?: string
  customCSS?: string
  customCSSURL?: string
}

const useAppStoreBase = defineStore('app', {
  state: () => ({
    api: {} as Not3Client,
    config: {
      baseURL: '/api/',
      drawURL: 'https://draw.not-th.re'
    } as UiConfig,
    info: {} as UiInfoResponse,
    id: '',
    keepContent: false,
    settings: false,
    readonly: false,
    content: '',
    loading: false,
    upload: false,
    p2pSend: false,
    expires: null as Date | null,
    detectedLanguage: null as string | null,
    selectedLanguage: null as string | null,
    dialog: null as null | Dialog,
    languageDefinitions: languageDefinitions.map((lang) => ({
      id: lang.id,
      extensions: lang.extensions,
      aliases: lang.aliases || [],
      mimeTypes: lang.mimeTypes || [],
    })).sort((a, b) => a.id.localeCompare(b.id)),
    excalidraw: false,
    sidePanel: null as 'sandbox' | 'tools' | null,
    activeToolId: 'base64',
    // Panel moved into its own window; the Window handle itself lives
    // module-scope in lib/sandbox/popout-bridge.ts (pinia state must stay
    // serializable).
    sandboxPopout: false,
    sandboxEngineId: '',
  }),
  actions: {
    async saveEncryptedNote(expiresIn?: number, selfDestruct?: boolean, openShareDialog?: 'url' | 'curl') {
      if (this.settings) try {
        const parsed = JSON.parse(this.content);
        const settingsStore = useSettingsStore();
        const migrated = migrateSettings(parsed);
        delete (settingsStore.editor as typeof settingsStore.editor & { keybindings?: unknown }).keybindings;
        settingsStore.$patch(migrated);
        this.pushToRouter("/", true);
      } catch (e) {
        console.error(e);
        this.dialog = new OkDialog("Error", "Invalid JSON in settings editor.");
      } else try {
        if (this.readonly) {
          const res = await new Promise<boolean>((resolve) => {
            this.dialog = new YesNoDialog(
              'Create copy?',
              'You did not change the already saved note. Do you want to create a copy?',
              () => resolve(true),
              () => resolve(false),
            )
          })
          if (!res) return
        }
        if (!this.content) {
          this.dialog = new OkDialog(
            'Empty content',
            'You cannot save an empty note. Please add some content before saving.',
          )
          return;
        }
        this.loading = true
        if (!expiresIn) expiresIn = this.info.maxStorageTimeDays * 24 * 60 * 60 - 60
        if (!selfDestruct) selfDestruct = false
        const mime = this.languageDefinitions.find((lang) => lang.id === this.selectedLanguage)?.mimeTypes[0] || 'text/plain'
        const link = await createNoteSnapshot({
          api: this.api, content: this.content, mime, expiresIn, selfDestruct,
          uiUrl: new URL(useRuntimeConfig().public.uiBaseURL || '/', window.location.origin).toString(),
          defaultApiBase: this.config.baseURL,
        })
        const url = new URL(link)
        if (openShareDialog) url.searchParams.set('share', openShareDialog)
        this.readonly = true
        this.pushToRouter(url.pathname + url.search + url.hash, true)
      } catch (error) {
        console.error(error)
        if (error instanceof AxiosError && error.response?.status === 413) {
          this.dialog = new OkDialog("Error", "The note is too large for this server (not enough tokens). Please try again later, as the server resets tokens periodically.")
        } else {
          this.dialog = new OkDialog("Error", "Failed to save note. Please try again later.")
        }
      } finally {
        this.loading = false
      }
    },
    async saveCoworkSnapshot() {
      if (!this.content) {
        this.dialog = new OkDialog('Empty content', 'You cannot save an empty note. Please add some content before saving.')
        return
      }
      this.loading = true
      try {
        const mime = this.languageDefinitions.find(lang => lang.id === this.selectedLanguage)?.mimeTypes[0] || 'text/plain'
        const link = await createNoteSnapshot({
          api: this.api, content: this.content, mime,
          expiresIn: this.info.maxStorageTimeDays * 24 * 60 * 60 - 60,
          uiUrl: new URL(useRuntimeConfig().public.uiBaseURL || '/', window.location.origin).toString(),
          defaultApiBase: this.config.baseURL,
        })
        this.dialog = new TextOutputDialog('Saved note', 'This snapshot is a separate encrypted note. Copy its link:', link)
      } catch (error) {
        console.error(error)
        this.dialog = new OkDialog('Error', 'Failed to save note. Please try again later.')
      } finally { this.loading = false }
    },
    getCurrentLanguage(): LanguageDefinition {
      return this.languageDefinitions.find((l) => l.id === (
        this.selectedLanguage || this.detectedLanguage || 'plaintext'
      )) || this.languageDefinitions[0]
    },
    pushToRouter(path: string, force = false) {
      if (!force && !this.readonly && this.content) {
        this.dialog = new YesNoDialog(
          'Discard changes?',
          'You have unsaved changes. Are you sure you want to discard them?',
          () => useRouter().push(path),
        )
      } else useRouter().push(path)
    }
  }
})

export function useAppStore(...args: Parameters<typeof useAppStoreBase>): ReturnType<typeof useAppStoreBase> & { sandbox: boolean } {
  const store = useAppStoreBase(...args) as ReturnType<typeof useAppStoreBase> & { sandbox: boolean };
  if (!Object.getOwnPropertyDescriptor(store, 'sandbox')) {
    Object.defineProperty(store, 'sandbox', {
      configurable: true,
      enumerable: false,
      get: () => store.sidePanel === 'sandbox',
      set: (open: boolean) => { store.sidePanel = open ? 'sandbox' : store.sidePanel === 'sandbox' ? null : store.sidePanel; },
    });
  }
  return store;
}
