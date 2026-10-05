import { afterEach, expect, it, vi } from 'vitest'
import { activeCowork, coworkShareOpen } from '~/lib/cowork/active'
import { SHARE_LINK } from '~/lib/actions/share-link'
import { SAVE_FOR_CUSTOM_TIME } from '~/lib/actions/save-for-custom-time'
import { SAVE_UNTIL_READ } from '~/lib/actions/save-until-read'
import { OPEN_EXCALIDRAW } from '~/lib/actions/open-excalidraw'
import { compileKeybindings } from '~/lib/keybindings/compile'
import { EDITOR_ACTIONS } from '~/lib/monaco/editor-actions'

afterEach(() => { activeCowork.value = null; coworkShareOpen.value = false; vi.unstubAllGlobals() })

it('sharing an active session opens its cowork link without saving a note', () => {
  const saveEncryptedNote = vi.fn()
  const store = { readonly: false, saveEncryptedNote, dialog: null }
  vi.stubGlobal('useAppStore', () => store)
  activeCowork.value = { session: { shareUrl: () => 'https://ui.example/c/room#secret' } } as never
  SHARE_LINK()
  expect(coworkShareOpen.value).toBe(true)
  expect(saveEncryptedNote).not.toHaveBeenCalled()
})

it('legacy save variants cannot navigate away from a live session', () => {
  const saveEncryptedNote = vi.fn()
  const store = { settings: false, saveEncryptedNote, dialog: null }
  vi.stubGlobal('useAppStore', () => store)
  activeCowork.value = { session: {} } as never
  SAVE_FOR_CUSTOM_TIME()
  SAVE_UNTIL_READ()
  expect(store.dialog).toBeNull()
  expect(saveEncryptedNote).not.toHaveBeenCalled()
})

it('keeps text mode active while the cowork text session is open', () => {
  const store = { config: { drawURL: 'https://draw.example/' }, settings: false, excalidraw: false, content: '' }
  vi.stubGlobal('useAppStore', () => store)
  activeCowork.value = { session: {} } as never
  OPEN_EXCALIDRAW()
  expect(store.excalidraw).toBe(false)
})

it('registers Start cowork through the shared command and keybinding path', () => {
  const action = EDITOR_ACTIONS.find(item => item.id === 'not3.startCowork')
  expect(action?.run).toBeDefined()
  const compiled = compileKeybindings([{ key: 'ctrl+alt+c', command: 'not3.startCowork' }], EDITOR_ACTIONS.map(item => item.id))
  expect(compiled.invalid).toEqual([])
  expect(compiled.resolve('not3.page', 'ctrl+alt+c', 0)).toMatchObject({ kind: 'command', command: 'not3.startCowork' })
  expect(compiled.resolve('editorTextFocus', 'ctrl+alt+c', 0)).toMatchObject({ kind: 'command', command: 'not3.startCowork' })
})
