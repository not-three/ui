import { Crypto, FragmentData, type Not3Client } from '@not3/sdk'

export async function createNoteSnapshot(options: {
  api: Not3Client
  content: string
  mime: string
  expiresIn: number
  uiUrl: string
  defaultApiBase: string
  selfDestruct?: boolean
}): Promise<string> {
  if (!options.content) throw new Error('Cannot save an empty note')
  const seed = Crypto.generateSeed()
  const key = await Crypto.generateKey(seed)
  const content = await Crypto.encrypt(options.content, key)
  const result = await options.api.notes().create({ content, expiresIn: options.expiresIn, selfDestruct: options.selfDestruct || false, mime: options.mime })
  const base = options.uiUrl.endsWith('/') ? options.uiUrl : `${options.uiUrl}/`
  const server = options.api.getOptions().baseUrl !== options.defaultApiBase ? options.api.getOptions().baseUrl : undefined
  return `${base}q/${result.id}#${new FragmentData({ seed, server, selfDestruct: options.selfDestruct }).toString()}`
}
