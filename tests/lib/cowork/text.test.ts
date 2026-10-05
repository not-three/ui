import { describe, expect, it, vi } from 'vitest'
import { CoworkText } from '~/lib/cowork/text'
import type { RoomFrame } from '~/lib/cowork/session'

class Link {
  other: Link | null = null
  id: string
  frames = new Set<(peer: string, frame: RoomFrame) => void>()
  peers = new Set<(peer: string, joined: boolean) => void>()
  constructor(id: string) { this.id = id }
  onFrame(fn: (peer: string, frame: RoomFrame) => void) { this.frames.add(fn); return () => this.frames.delete(fn) }
  onPeer(fn: (peer: string, joined: boolean) => void) { this.peers.add(fn); return () => this.peers.delete(fn) }
  async send(type: 0 | 1 | 2 | 3 | 4, payload: Uint8Array, peer?: string) {
    if (!this.other || (peer && peer !== this.other.id)) return
    for (const fn of this.other.frames) fn(this.id, { type, payload })
  }
  connect(other: Link) { this.other = other; other.other = this; for (const fn of this.peers) fn(other.id, true); for (const fn of other.peers) fn(this.id, true) }
  disconnect() { if (!this.other) return; const other = this.other; this.other = null; other.other = null; for (const fn of other.peers) fn(this.id, false) }
}

describe('cowork text', () => {
  it('syncs two editors and mirrors remote changes without a feedback loop', async () => {
    const a = new Link('a'), b = new Link('b')
    const aContent = vi.fn(), bContent = vi.fn()
    const alice = new CoworkText(a, { content: 'first', onContent: aContent, name: 'Alice', color: '#f00', peerId: 'a' })
    const bob = new CoworkText(b, { content: '', onContent: bContent, name: 'Bob', color: '#0f0', peerId: 'b' })
    a.connect(b)
    await vi.waitFor(() => expect(bob.text.toString()).toBe('first'))
    bob.text.insert(5, ' second')
    await vi.waitFor(() => expect(alice.text.toString()).toBe('first second'))
    expect(bContent).toHaveBeenCalledWith('first')
    expect(aContent).toHaveBeenCalledWith('first second')
    alice.destroy(); bob.destroy()
  })

  it('sends the whole document to a late joiner', async () => {
    const a = new Link('a'), c = new Link('c')
    const alice = new CoworkText(a, { content: 'first', name: 'Alice', color: '#f00', peerId: 'a' })
    alice.text.insert(5, ' and later')
    const third = new CoworkText(c, { content: '', name: 'Cara', color: '#00f', peerId: 'c' })
    a.connect(c)
    await vi.waitFor(() => expect(third.text.toString()).toBe('first and later'))
    alice.destroy(); third.destroy()
  })

  it('removes a departed peer awareness immediately', async () => {
    const a = new Link('a'), b = new Link('b')
    const alice = new CoworkText(a, { content: '', name: 'Alice', color: '#f00', peerId: 'a' })
    const bob = new CoworkText(b, { content: '', name: 'Bob', color: '#0f0', peerId: 'b' })
    a.connect(b)
    await vi.waitFor(() => expect([...alice.awareness.getStates().values()].some(state => state.user?.name === 'Bob')).toBe(true))
    b.disconnect()
    expect([...alice.awareness.getStates().values()].some(state => state.user?.name === 'Bob')).toBe(false)
    alice.destroy(); bob.destroy()
  })

  it('expires a silent peer within five seconds', async () => {
    vi.useFakeTimers()
    try {
      const a = new Link('a'), b = new Link('b')
      const stale = vi.fn()
      const seen = vi.fn()
      const alice = new CoworkText(a, { content: '', name: 'Alice', color: '#f00', peerId: 'a', onStalePeer: stale, onSeenPeer: seen })
      const bob = new CoworkText(b, { content: '', name: 'Bob', color: '#0f0', peerId: 'b' })
      a.connect(b)
      expect([...alice.awareness.getStates().values()].some(state => state.user?.name === 'Bob')).toBe(true)
      a.other = null; b.other = null
      await vi.advanceTimersByTimeAsync(4500)
      expect([...alice.awareness.getStates().values()].some(state => state.user?.name === 'Bob')).toBe(false)
      expect(stale).toHaveBeenCalledWith('b')
      a.other = b; b.other = a
      bob.awareness.setLocalStateField('heartbeat', Date.now())
      expect(seen).toHaveBeenCalledWith('b', 'Bob')
      alice.destroy(); bob.destroy()
    } finally { vi.useRealTimers() }
  })
})
