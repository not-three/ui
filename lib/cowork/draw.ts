import type { CoworkSession, RoomFrame } from './session'

export type DrawElement = { id: string; version: number; versionNonce: number; isDeleted: boolean; index?: string | null; [key: string]: unknown }
type Pointer = { x: number; y: number } | null
type Awareness = { pointer: Pointer; selected: string[]; name: string; color: string }
type PeerPointer = Awareness & { id: string }
type DrawMessage = { type: string; payload?: unknown }
type DrawSession = Pick<CoworkSession, 'peerId' | 'participants' | 'onFrame' | 'onPeer' | 'send'>
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })

function preferred(a: DrawElement, b: DrawElement): DrawElement {
  if (a.version !== b.version) return a.version > b.version ? a : b
  if (a.versionNonce !== b.versionNonce) return a.versionNonce < b.versionNonce ? a : b
  if (a.isDeleted !== b.isDeleted) return a.isDeleted ? a : b
  return JSON.stringify(a) <= JSON.stringify(b) ? a : b
}

export function reconcileDraw(elements: readonly DrawElement[], incoming: readonly DrawElement[]): DrawElement[] {
  const byId = new Map<string, DrawElement>()
  for (const element of [...elements, ...incoming]) {
    const current = byId.get(element.id)
    byId.set(element.id, current ? preferred(current, element) : element)
  }
  return [...byId.values()].sort((a, b) => {
    if (a.index != null && b.index != null) {
      if (a.index !== b.index) return a.index < b.index ? -1 : 1
      if (a.id !== b.id) return a.id < b.id ? -1 : 1
    }
    return 0
  })
}

function validElements(value: unknown): value is DrawElement[] {
  return Array.isArray(value) && value.every(item => item && typeof item === 'object' && typeof item.id === 'string' && Number.isFinite(item.version) && Number.isFinite(item.versionNonce) && typeof item.isDeleted === 'boolean')
}

function validAwareness(value: unknown): value is Awareness {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Awareness>
  return (item.pointer === null || !!item.pointer && Number.isFinite(item.pointer.x) && Number.isFinite(item.pointer.y)) && Array.isArray(item.selected) && item.selected.every(id => typeof id === 'string') && typeof item.name === 'string' && typeof item.color === 'string'
}

export class CoworkDraw {
  private scene: DrawElement[]
  private started = false
  private ready = false
  private stopped = false
  private startRetry: ReturnType<typeof setTimeout> | null = null
  private pendingRequests = new Set<string>()
  private pendingCaptures = new Set<() => void>()
  private pointers = new Map<string, PeerPointer>()
  private offFrame: () => void
  private offPeer: () => void

  constructor(private readonly session: DrawSession, private readonly iframe: Pick<Window, 'postMessage'>, private readonly origin: string, private readonly options: { initial: DrawElement[]; onContent: (content: string) => void }) {
    this.scene = reconcileDraw([], options.initial)
    this.offFrame = session.onFrame((peerId, frame) => this.onFrame(peerId, frame))
    this.offPeer = session.onPeer((peerId, joined) => this.onPeer(peerId, joined))
    this.publish()
  }

  get elements() { return this.scene }

  start() {
    if (this.stopped) return
    this.started = true
    this.ready = false
    this.post('start', { self: this.self() })
    for (const peer of this.session.participants) if (peer.connected && peer.peerId !== this.session.peerId) void this.session.send(4, new Uint8Array(), peer.peerId)
    this.retryStart()
  }

  setIdentity() { if (this.started && !this.stopped) this.start() }

  requestScene(): Promise<void> {
    if (!this.started || this.stopped) return Promise.resolve()
    return new Promise(resolve => {
      const timer = setTimeout(() => { this.pendingCaptures.delete(finish); finish() }, 2000)
      const finish = () => { clearTimeout(timer); resolve() }
      this.pendingCaptures.add(finish)
      this.post('scene-request', {})
    })
  }

  handleMessage(event: Pick<MessageEvent, 'source' | 'origin' | 'data'>): boolean {
    if (this.stopped || !this.started || event.source !== this.iframe || event.origin !== this.origin) return false
    const message = event.data as DrawMessage
    if (!message || typeof message !== 'object' || typeof message.type !== 'string') return false
    const payload = message.payload as { elements?: unknown; pointer?: unknown; selected?: unknown } | undefined
    if (message.type === 'not3/draw/collab/scene') {
      if (!validElements(payload?.elements)) return false
      const before = this.scene
      this.scene = reconcileDraw(this.scene, payload.elements)
      this.ready = true
      if (this.startRetry) clearTimeout(this.startRetry)
      this.startRetry = null
      if (JSON.stringify(this.scene) !== JSON.stringify(payload.elements)) this.post('elements', { elements: this.scene })
      if (JSON.stringify(before) !== JSON.stringify(this.scene)) this.publish()
      for (const peerId of this.pendingRequests) this.sendScene(peerId)
      this.pendingRequests.clear()
      for (const finish of this.pendingCaptures) finish()
      this.pendingCaptures.clear()
      return true
    }
    if (message.type === 'not3/draw/collab/delta') {
      if (!validElements(payload?.elements)) return false
      const before = new Map(this.scene.map(element => [element.id, element]))
      this.scene = reconcileDraw(this.scene, payload.elements)
      const changed = payload.elements.filter(element => {
        const winner = this.scene.find(item => item.id === element.id)
        return winner === element && JSON.stringify(before.get(element.id)) !== JSON.stringify(element)
      })
      if (changed.length) {
        this.publish()
        void this.session.send(3, encoder.encode(JSON.stringify(changed)))
      }
      return true
    }
    if (message.type === 'not3/draw/collab/pointer') {
      if (!payload || !validAwareness({ pointer: payload.pointer, selected: payload.selected, name: this.self().name, color: this.self().color })) return false
      const self = this.self()
      void this.session.send(2, encoder.encode(JSON.stringify({ pointer: payload.pointer, selected: payload.selected, name: self.name, color: self.color })))
      return true
    }
    return false
  }

  destroy() {
    if (this.stopped) return
    this.stopped = true
    if (this.startRetry) clearTimeout(this.startRetry)
    this.startRetry = null
    this.offFrame()
    this.offPeer()
    if (this.started) this.post('stop', {})
    this.pointers.clear()
    this.pendingRequests.clear()
    for (const finish of this.pendingCaptures) finish()
    this.pendingCaptures.clear()
  }

  private retryStart() {
    if (this.startRetry) clearTimeout(this.startRetry)
    this.startRetry = setTimeout(() => {
      this.startRetry = null
      if (this.stopped || this.ready) return
      this.post('start', { self: this.self() })
      this.retryStart()
    }, 250)
  }

  private self() {
    const peer = this.session.participants.find(item => item.peerId === this.session.peerId)
    return { id: this.session.peerId, name: peer?.name || '', color: peer?.color || '' }
  }

  private publish() { this.options.onContent(JSON.stringify({ type: 'EXCALIDRAW', data: this.scene })) }
  private post(name: string, payload: unknown) { this.iframe.postMessage({ type: `not3/draw/collab/${name}`, payload }, this.origin) }
  private sendScene(peerId: string) { void this.session.send(3, encoder.encode(JSON.stringify(this.scene)), peerId) }

  private onPeer(peerId: string, joined: boolean) {
    if (this.stopped) return
    if (joined) void this.session.send(4, new Uint8Array(), peerId)
    else {
      this.pointers.delete(peerId)
      this.pendingRequests.delete(peerId)
      if (this.started) this.postPointers()
    }
  }

  private onFrame(peerId: string, frame: RoomFrame) {
    if (this.stopped) return
    try {
      if (frame.type === 4) {
        if (this.ready) this.sendScene(peerId)
        else {
          this.pendingRequests.add(peerId)
          if (this.started) this.post('scene-request', {})
        }
      } else if (frame.type === 3) {
        const incoming = JSON.parse(decoder.decode(frame.payload)) as unknown
        if (!validElements(incoming)) return
        const before = JSON.stringify(this.scene)
        this.scene = reconcileDraw(this.scene, incoming)
        if (JSON.stringify(this.scene) !== before) {
          this.publish()
          if (this.started && this.ready) this.post('elements', { elements: this.scene })
        }
      } else if (frame.type === 2) {
        const awareness = JSON.parse(decoder.decode(frame.payload)) as unknown
        if (!validAwareness(awareness)) return
        const peer = this.session.participants.find(item => item.peerId === peerId)
        this.pointers.set(peerId, { id: peerId, ...awareness, name: peer?.name || awareness.name, color: peer?.color || awareness.color })
        if (this.started) this.postPointers()
      }
    } catch { /* Ignore malformed frames from peers. */ }
  }

  private postPointers() { this.post('pointers', { peers: [...this.pointers.values()] }) }
}
