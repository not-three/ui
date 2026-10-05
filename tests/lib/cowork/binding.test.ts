import { expect, it, vi } from 'vitest'
import { CoworkText } from '~/lib/cowork/text'

const bindings = vi.hoisted(() => [] as { destroy: ReturnType<typeof vi.fn> }[])
vi.mock('y-monaco', () => ({ MonacoBinding: class {
  destroy = vi.fn()
  constructor() { bindings.push(this) }
} }))

it('an old Monaco cleanup does not destroy a newer binding', async () => {
  const text = new CoworkText({ onFrame: () => () => {}, onPeer: () => () => {}, send: async () => {} }, { content: '', name: 'Alice', color: '#f00', peerId: 'a' })
  try {
    const old = await text.bindMonaco({} as never, {} as never)
    await text.bindMonaco({} as never, {} as never)
    old()
    expect(bindings[1]!.destroy).not.toHaveBeenCalled()
  } finally { text.destroy() }
})
