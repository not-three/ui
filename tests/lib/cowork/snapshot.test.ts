import { expect, it, vi } from 'vitest'
import { Crypto, FragmentData } from '@not3/sdk'
import { createNoteSnapshot } from '~/lib/cowork/snapshot'

it('creates an encrypted immutable note link without changing the current route', async () => {
  const create = vi.fn(async (_input: unknown) => ({ id: 'saved-note' }))
  const before = window.location.href
  const link = await createNoteSnapshot({
    api: { notes: () => ({ create }), getOptions: () => ({ baseUrl: 'https://api.example/' }) } as never,
    content: 'live document', mime: 'text/plain', expiresIn: 3600,
    uiUrl: 'https://ui.example/', defaultApiBase: 'https://api.example/',
  })
  const saved = create.mock.calls[0]![0] as { content: string; selfDestruct: boolean }
  const fragment = FragmentData.fromURL(link)
  expect(await Crypto.decrypt(saved.content, await Crypto.generateKey(fragment.seed))).toBe('live document')
  expect(saved.selfDestruct).toBe(false)
  expect(new URL(link).pathname).toBe('/q/saved-note')
  expect(window.location.href).toBe(before)
})

it('keeps the existing self-destruct save mode when requested', async () => {
  const create = vi.fn(async (_input: unknown) => ({ id: 'once' }))
  const link = await createNoteSnapshot({
    api: { notes: () => ({ create }), getOptions: () => ({ baseUrl: '/api/' }) } as never,
    content: 'one read', mime: 'text/plain', expiresIn: 60,
    uiUrl: 'https://ui.example/', defaultApiBase: '/api/', selfDestruct: true,
  })
  expect(create.mock.calls[0]![0]).toMatchObject({ selfDestruct: true })
  expect(FragmentData.fromURL(link).selfDestruct).toBe(true)
})
