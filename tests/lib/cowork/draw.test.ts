import { describe, expect, it, vi } from 'vitest'
import { CoworkDraw, reconcileDraw } from '~/lib/cowork/draw'
import type { RoomFrame } from '~/lib/cowork/session'

type Element = { id: string; version: number; versionNonce: number; isDeleted: boolean; index: string | null }
const shape = (id: string, version = 1, versionNonce = 20, isDeleted = false, index: string | null = null): Element => ({ id, version, versionNonce, isDeleted, index })
const decoder = new TextDecoder()

function setup(initial: Element[] = []) {
  const sent: { type: number; payload: unknown; peerId?: string }[] = []
  const frames = new Set<(peerId: string, frame: RoomFrame) => void>()
  const peers = new Set<(peerId: string, joined: boolean) => void>()
  const session = {
    peerId: 'alice',
    participants: [{ peerId: 'alice', name: 'Alice', color: '#abc', connected: true }, { peerId: 'bob', name: 'Bob', color: '#def', connected: true }],
    onFrame: (callback: (peerId: string, frame: RoomFrame) => void) => { frames.add(callback); return () => { frames.delete(callback) } },
    onPeer: (callback: (peerId: string, joined: boolean) => void) => { peers.add(callback); return () => { peers.delete(callback) } },
    send: vi.fn(async (type: number, data: Uint8Array, peerId?: string) => { sent.push({ type, payload: type === 4 ? null : JSON.parse(decoder.decode(data)), peerId }) }),
  }
  const target = { postMessage: vi.fn() }
  let content = ''
  const adapter = new CoworkDraw(session as never, target as never, 'https://draw.example', { initial, onContent: value => { content = value } })
  const receive = (peerId: string, type: 2 | 3 | 4, payload: unknown = null) => {
    const frame = { type, payload: type === 4 ? new Uint8Array() : new TextEncoder().encode(JSON.stringify(payload)) } as RoomFrame
    for (const callback of frames) callback(peerId, frame)
  }
  const iframe = (type: string, payload: unknown) => adapter.handleMessage({ source: target, origin: 'https://draw.example', data: { type: `not3/draw/collab/${type}`, payload } } as never)
  return { adapter, session, target, sent, receive, iframe, peers, get content() { return content } }
}

describe('drawing cowork relay', () => {
  it('orders mixed indexed and unindexed elements identically regardless of arrival order', () => {
    const indexedLow = shape('indexed-low', 1, 20, false, 'a1')
    const indexedHigh = shape('indexed-high', 1, 20, false, 'a2')
    const unindexed = shape('unindexed', 1, 20, false, null)
    const expected = [indexedLow, indexedHigh, unindexed]
    expect(reconcileDraw([unindexed, indexedHigh], [indexedLow])).toEqual(expected)
    expect(reconcileDraw([indexedLow], [indexedHigh, unindexed])).toEqual(expected)
  })

  it('sends only local changed elements and awareness with identity', () => {
    const t = setup()
    t.adapter.start()
    t.iframe('scene', { elements: [] })
    t.iframe('delta', { elements: [shape('rect')] })
    t.iframe('pointer', { pointer: { x: 9, y: 12 }, selected: ['rect'] })
    expect(t.sent).toContainEqual({ type: 3, payload: [shape('rect')], peerId: undefined })
    expect(t.sent).toContainEqual({ type: 2, payload: { pointer: { x: 9, y: 12 }, selected: ['rect'], name: 'Alice', color: '#abc' }, peerId: undefined })
    expect(JSON.parse(t.content)).toEqual({ type: 'EXCALIDRAW', data: [shape('rect')] })
  })

  it('reconciles remote elements and forwards named pointers without echoing elements', () => {
    const t = setup([shape('rect', 2, 10)])
    t.adapter.start()
    t.iframe('scene', { elements: [shape('rect', 2, 10)] })
    t.receive('bob', 3, [shape('rect', 1, 1), shape('circle')])
    t.receive('bob', 2, { pointer: { x: 3, y: 4 }, selected: ['circle'], name: 'Bob', color: '#def' })
    expect(t.target.postMessage).toHaveBeenCalledWith({ type: 'not3/draw/collab/elements', payload: { elements: [shape('circle'), shape('rect', 2, 10)] } }, 'https://draw.example')
    expect(t.target.postMessage).toHaveBeenCalledWith({ type: 'not3/draw/collab/pointers', payload: { peers: [{ id: 'bob', name: 'Bob', color: '#def', pointer: { x: 3, y: 4 }, selected: ['circle'] }] } }, 'https://draw.example')
    expect(t.sent.filter(frame => frame.type === 3)).toEqual([])
    expect(JSON.parse(t.content).data).toEqual([shape('circle'), shape('rect', 2, 10)])
  })

  it('requests an existing peer scene after a late iframe mount', () => {
    const t = setup()
    t.adapter.start()
    expect(t.sent).toContainEqual({ type: 4, payload: null, peerId: 'bob' })
    t.adapter.destroy()
  })

  it('requests a scene from a joining peer and answers scene requests after iframe readiness', () => {
    const t = setup([shape('rect')])
    for (const peer of t.peers) peer('bob', true)
    expect(t.sent).toContainEqual({ type: 4, payload: null, peerId: 'bob' })
    t.receive('bob', 4)
    t.adapter.start()
    t.iframe('scene', { elements: [shape('rect'), shape('circle')] })
    expect(t.sent).toContainEqual({ type: 3, payload: [shape('circle'), shape('rect')], peerId: 'bob' })
  })

  it('resolves concurrent versions, lower nonces, deletion ties, and mixed indices', () => {
    const t = setup([shape('a', 2, 30), shape('b', 3, 4), shape('c', 1, 9, false, 'a2')])
    t.adapter.start()
    t.iframe('scene', { elements: [shape('a', 2, 30), shape('b', 3, 4), shape('c', 1, 9, false, 'a2')] })
    t.receive('bob', 3, [shape('a', 3, 90), shape('b', 3, 2), shape('c', 1, 9, true, 'a2'), shape('d', 1, 1, false, null)])
    expect(JSON.parse(t.content).data).toEqual([shape('c', 1, 9, true, 'a2'), shape('a', 3, 90), shape('b', 3, 2), shape('d', 1, 1, false, null)])
    t.iframe('delta', { elements: [shape('a', 2, 1), shape('b', 3, 8)] })
    expect(JSON.parse(t.content).data.find((element: Element) => element.id === 'a')).toEqual(shape('a', 3, 90))
    expect(t.sent.filter(frame => frame.type === 3)).toEqual([])
  })

  it('captures the iframe scene before a Save as note snapshot', async () => {
    const t = setup()
    t.adapter.start()
    t.iframe('scene', { elements: [] })
    const capture = t.adapter.requestScene()
    expect(t.target.postMessage).toHaveBeenLastCalledWith({ type: 'not3/draw/collab/scene-request', payload: {} }, 'https://draw.example')
    t.iframe('scene', { elements: [shape('fresh')] })
    await capture
    expect(JSON.parse(t.content).data).toEqual([shape('fresh')])
  })

  it('relays a locally captured scene if save beats the coalesced delta', () => {
    const t = setup()
    t.adapter.start()
    t.iframe('scene', { elements: [] })
    t.iframe('scene', { elements: [shape('fresh')] })
    t.iframe('delta', { elements: [shape('fresh')] })
    expect(t.sent.filter(frame => frame.type === 3)).toEqual([{ type: 3, payload: [shape('fresh')], peerId: undefined }])
  })

  it('rejects messages from another source or origin and clears pointers on leave', () => {
    const t = setup()
    t.adapter.start()
    expect(t.adapter.handleMessage({ source: t.target, origin: 'https://evil.example', data: { type: 'not3/draw/collab/delta', payload: { elements: [shape('bad')] } } } as never)).toBe(false)
    expect(t.sent.filter(frame => frame.type === 3)).toEqual([])
    t.receive('bob', 2, { pointer: null, selected: [], name: 'Bob', color: '#def' })
    for (const peer of t.peers) peer('bob', false)
    expect(t.target.postMessage).toHaveBeenLastCalledWith({ type: 'not3/draw/collab/pointers', payload: { peers: [] } }, 'https://draw.example')
    t.adapter.destroy()
    expect(t.target.postMessage).toHaveBeenLastCalledWith({ type: 'not3/draw/collab/stop', payload: {} }, 'https://draw.example')
  })
})
