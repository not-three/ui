import type { InfoResponse, Not3Client } from "@not3/sdk"
import { Crypto, FragmentData } from "@not3/sdk"
import { YesNoDialog, type Dialog } from "~/lib/dialog"
import { languageDefinitions } from "~/lib/monaco/languages"
import type { LanguageDefinition } from "~/lib/monaco/types"

type UiConfig = {
  baseURL: string
  termsURL?: string
  pullRequest?: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    api: {} as Not3Client,
    config: {
      baseURL: '/api/',
    } as UiConfig,
    info: {} as InfoResponse,
    id: '',
    keepContent: false,
    settings: false,
    readonly: false,
    content: '',
    loading: false,
    upload: false,
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
  }),
  actions: {
    async saveEncryptedNote(expiresIn?: number, selfDestruct?: boolean) {
      try {
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
        this.loading = true
        if (!expiresIn) expiresIn = this.info.maxStorageTimeDays * 24 * 60 * 60 - 60
        if (!selfDestruct) selfDestruct = false
        const seed = Crypto.generateSeed()
        const key = await Crypto.generateKey(seed)
        const content = await Crypto.encrypt(this.content, key)
        const mime = this.languageDefinitions.find((lang) => lang.id === this.selectedLanguage)?.mimeTypes[0] || 'text/plain'
        const res = await this.api.notes().create({ content, expiresIn, selfDestruct, mime})
        const options = this.api.getOptions()
        const server = options.baseUrl !== this.config.baseURL ? options.baseUrl : undefined
        const fragment = new FragmentData({ seed, selfDestruct, server })
        this.readonly = true
        this.pushToRouter(`/q/${res.id}#${fragment.toString()}`, true)
      } finally {
        this.loading = false
      }
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
