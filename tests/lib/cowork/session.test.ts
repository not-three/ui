import { describe, expect, it, vi } from 'vitest'
import { decodeFrame, encodeFrame, colorForPeer, CoworkSession } from '~/lib/cowork/session'

class FakeRoom {
  peerId: string | null = null
  joinPeerId = 'joiner'
  joinPeers = ['creator']
  joinError: Error | null = null
  onMessage: ((id: string, data: ArrayBuffer | string) => void) | null = null
  onPeerJoined: ((id: string) => void) | null = null
  onPeerLeft: ((id: string) => void) | null = null
  onClose: ((error?: Error) => void) | null = null
  sent: { id: string; data: Uint8Array }[] = []
  members: { id: string; connected: boolean }[] = []
  async create() { this.peerId = 'creator'; return { roomId: 'room', peerId: 'creator' } }
  async join() { if (this.joinError) { this.onClose?.(this.joinError); throw this.joinError } this.peerId = this.joinPeerId; return { peerId: this.joinPeerId, peers: this.joinPeers } }
  peers() { return this.members }
  async send(id: string, data: Uint8Array) { this.sent.push({ id, data }) }
  async broadcast(data: Uint8Array) { for (const member of this.members) if (member.connected) await this.send(member.id, data) }
  leave() { this.onClose?.() }
}

describe('room frames', () => {
  it('roundtrips the binary protocol including draw frame types', () => {
    for (const type of [0, 1, 2, 3, 4] as const) {
      const payload = type === 4 ? new Uint8Array() : new Uint8Array([7, 8])
      const frame = decodeFrame(encodeFrame(type, payload))
      expect(frame.type).toBe(type)
      expect([...frame.payload]).toEqual([...payload])
    }
  })

  it('rejects malformed and unknown frames', () => {
    expect(() => decodeFrame(new Uint8Array())).toThrow()
    expect(() => decodeFrame(new Uint8Array([9]))).toThrow()
    expect(() => decodeFrame(new Uint8Array([4, 1]))).toThrow()
    expect(() => decodeFrame('hello')).toThrow()
  })
})

describe('session membership', () => {
  it('assigns a stable palette color and removes a departed participant', async () => {
    const room = new FakeRoom()
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Alice', language: 'typescript' })
    await session.create()
    room.onPeerJoined?.('bob')
    room.onMessage?.('bob', encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'text', name: 'Bob', color: '#000', language: 'python' }))).buffer as ArrayBuffer)
    expect(session.participants.find(p => p.peerId === 'bob')).toEqual({ peerId: 'bob', name: 'Bob', color: colorForPeer('bob'), connected: true })
    expect(colorForPeer('bob')).toBe(colorForPeer('bob'))
    room.onPeerLeft?.('bob')
    expect(session.participants.map(p => p.peerId)).toEqual(['creator'])
  })

  it('keeps creator language authoritative and propagates later changes', async () => {
    const room = new FakeRoom()
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Alice', language: 'typescript' })
    await session.create()
    room.onPeerJoined?.('bob')
    room.onMessage?.('bob', encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'text', name: 'Bob', color: '#000', language: 'python' }))).buffer as ArrayBuffer)
    expect(session.language).toBe('typescript')
    room.members = [{ id: 'bob', connected: true }]
    await session.setLanguage('javascript')
    expect(JSON.parse(new TextDecoder().decode(decodeFrame(room.sent.at(-1)!.data).payload)).language).toBe('javascript')
  })

  it('accepts language updates only from the creator on a joiner', async () => {
    const room = new FakeRoom()
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Bob' })
    await session.join('room')
    const hello = (name: string, language: string) => encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'text', name, color: '#fff', language }))).buffer as ArrayBuffer
    room.onMessage?.('creator', hello('Alice', 'typescript'))
    expect(session.language).toBe('typescript')
    room.onMessage?.('cara', hello('Cara', 'python'))
    expect(session.language).toBe('typescript')
    room.onMessage?.('creator', hello('Alice', 'javascript'))
    expect(session.language).toBe('javascript')
  })

  it('keeps creator language authority when the creator rejoins with a new peer ID', async () => {
    vi.useFakeTimers()
    try {
      const original = new FakeRoom(), rejoined = new FakeRoom(), joinerRoom = new FakeRoom()
      rejoined.joinPeerId = 'creator-2'
      rejoined.joinPeers = ['joiner']
      const creatorRooms = [original, rejoined]
      const creator = new CoworkSession({ makeRoom: () => creatorRooms.shift()! as never, seed: 'seed', kind: 'text', name: 'Alice', language: 'typescript' })
      const joiner = new CoworkSession({ makeRoom: () => joinerRoom as never, seed: 'seed', kind: 'text', name: 'Bob' })
      await creator.create()
      await joiner.join('room')
      original.onPeerJoined?.('joiner')
      joinerRoom.onMessage?.('creator', original.sent.at(-1)!.data.buffer as ArrayBuffer)
      expect(joiner.language).toBe('typescript')

      original.onClose?.()
      joinerRoom.onPeerLeft?.('creator')
      await vi.advanceTimersByTimeAsync(1000)
      rejoined.members = [{ id: 'joiner', connected: true }]
      await creator.setLanguage('javascript')
      joinerRoom.onMessage?.('creator-2', rejoined.sent.at(-1)!.data.buffer as ArrayBuffer)
      expect(joiner.language).toBe('javascript')
      creator.leave()
      joiner.leave()
    } finally { vi.useRealTimers() }
  })

  it('accepts the creator language for a late joiner when another joiner is the oldest peer', async () => {
    const room = new FakeRoom()
    room.joinPeers = ['existing-joiner', 'creator-2']
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Cara' })
    await session.join('room')
    room.onMessage?.('existing-joiner', encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'text', name: 'Bob', color: '#fff', creator: false, language: 'stale' }))).buffer as ArrayBuffer)
    expect(session.language).toBe('')
    room.onMessage?.('creator-2', encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'text', name: 'Alice', color: '#fff', creator: true, language: 'python' }))).buffer as ArrayBuffer)
    expect(session.language).toBe('python')
    session.leave()
  })

  it('reports a mismatched document kind and leaves', async () => {
    const room = new FakeRoom()
    const mismatch = vi.fn()
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Alice', onKindMismatch: mismatch })
    await session.create()
    room.onMessage?.('bob', encodeFrame(0, new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'draw', name: 'Bob', color: '#fff' }))).buffer as ArrayBuffer)
    expect(mismatch).toHaveBeenCalledOnce()
    expect(session.status).toBe('closed')
  })

  it('saves a snapshot without closing the room', async () => {
    const room = new FakeRoom()
    const save = vi.fn(async () => {})
    const session = new CoworkSession({ makeRoom: () => room as never, seed: 'seed', kind: 'text', name: 'Alice', saveAsNote: save })
    await session.create()
    await session.saveAsNote()
    expect(save).toHaveBeenCalledOnce()
    expect(session.status).toBe('joined')
  })

  it('keeps live peers on signaling loss and retries with a new room after isolation', async () => {
    vi.useFakeTimers()
    try {
      const first = new FakeRoom()
      const second = new FakeRoom()
      const rooms = [first, second]
      const session = new CoworkSession({ makeRoom: () => rooms.shift()! as never, seed: 'seed', kind: 'text', name: 'Alice' })
      await session.join('room')
      first.members = [{ id: 'creator', connected: true }]
      session.signalingLost()
      expect(session.banner).toBe('Connection to server lost: current participants can keep working, new ones cannot join')
      first.members = []
      first.onClose?.()
      await vi.advanceTimersByTimeAsync(1000)
      expect(second.peerId).toBe('joiner')
      expect(session.banner).toBe('')
      session.leave()
      expect(first.onClose).toBeNull()
      expect(second.onClose).toBeNull()
    } finally { vi.useRealTimers() }
  })

  it.each(['not-found', 'session-full'])('stops rejoining when a previously joined room returns %s', async code => {
    vi.useFakeTimers()
    try {
      const first = new FakeRoom(), rejected = new FakeRoom()
      rejected.joinError = Object.assign(new Error(code), { code })
      const rooms = [first, rejected]
      const errors: Error[] = []
      const session = new CoworkSession({ makeRoom: () => rooms.shift()! as never, seed: 'seed', kind: 'text', name: 'Alice', onError: error => errors.push(error) })
      await session.join('room')
      first.onClose?.()
      await vi.advanceTimersByTimeAsync(1000)
      expect(session.status).toBe('closed')
      expect(errors).toEqual([rejected.joinError])
      await vi.advanceTimersByTimeAsync(60000)
      expect(rooms).toHaveLength(0)
      session.leave()
    } finally { vi.useRealTimers() }
  })

  it('uses exponential backoff after a transient rejoin failure', async () => {
    vi.useFakeTimers()
    try {
      const first = new FakeRoom(), rejected = new FakeRoom(), recovered = new FakeRoom()
      rejected.joinError = new Error('temporary gateway outage')
      const rooms = [first, rejected, recovered]
      const session = new CoworkSession({ makeRoom: () => rooms.shift()! as never, seed: 'seed', kind: 'text', name: 'Alice' })
      await session.join('room')
      first.onClose?.()
      await vi.advanceTimersByTimeAsync(1000)
      expect(session.status).toBe('joining')
      await vi.advanceTimersByTimeAsync(1000)
      expect(recovered.peerId).toBeNull()
      await vi.advanceTimersByTimeAsync(1000)
      expect(session.status).toBe('joined')
      session.leave()
    } finally { vi.useRealTimers() }
  })

  it('ignores callbacks from a room replaced during rejoin', async () => {
    vi.useFakeTimers()
    try {
      const first = new FakeRoom(), second = new FakeRoom()
      const rooms = [first, second]
      const lost: (() => void)[] = []
      const session = new CoworkSession({ makeRoom: options => { lost.push(options.onSignalingLost!); return rooms.shift()! as never }, seed: 'seed', kind: 'text', name: 'Alice' })
      await session.join('room')
      first.onClose?.()
      await vi.advanceTimersByTimeAsync(1000)
      expect(session.status).toBe('joined')
      lost[0]!()
      expect(session.banner).toBe('')
      session.leave()
    } finally { vi.useRealTimers() }
  })

  it('clears old peer awareness listeners when an isolated room closes', async () => {
    vi.useFakeTimers()
    try {
      const first = new FakeRoom(), second = new FakeRoom()
      const rooms = [first, second]
      const session = new CoworkSession({ makeRoom: () => rooms.shift()! as never, seed: 'seed', kind: 'text', name: 'Bob' })
      const departed: string[] = []
      session.onPeer((id, joined) => { if (!joined) departed.push(id) })
      await session.join('room')
      first.onPeerJoined?.('creator')
      first.onClose?.()
      expect(departed).toContain('creator')
      expect(session.participants.some(peer => peer.peerId === 'creator')).toBe(false)
      session.leave()
    } finally { vi.useRealTimers() }
  })
})
