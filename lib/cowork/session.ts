import type { P2PRoom } from '@not3/sdk'
import { FragmentData } from '@not3/sdk'
import { reactive } from 'vue'

export type CoworkKind = 'text' | 'draw'
export type FrameType = 0 | 1 | 2 | 3 | 4
export type Participant = { peerId: string; name: string; color: string; connected: boolean }
export type RoomFrame = { type: FrameType; payload: Uint8Array }

const palette = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#2dd4bf', '#38bdf8', '#a78bfa', '#f472b6']
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
export const SIGNALING_LOST = 'Connection to server lost: current participants can keep working, new ones cannot join'

export function colorForPeer(peerId: string): string {
  let hash = 2166136261
  for (const ch of peerId) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619)
  return palette[(hash >>> 0) % palette.length]!
}

export function encodeFrame(type: FrameType, payload: Uint8Array = new Uint8Array()): Uint8Array {
  if (type < 0 || type > 4 || (type === 4 && payload.length)) throw new Error('Invalid cowork frame')
  const frame = new Uint8Array(payload.length + 1)
  frame[0] = type
  frame.set(payload, 1)
  return frame
}

export function decodeFrame(input: ArrayBuffer | Uint8Array | string): RoomFrame {
  if (typeof input === 'string') throw new Error('Cowork frames must be binary')
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  if (!bytes.length || bytes[0]! > 4 || (bytes[0] === 4 && bytes.length !== 1)) throw new Error('Invalid cowork frame')
  return { type: bytes[0] as FrameType, payload: bytes.subarray(1) }
}

type Hello = { v: 1; kind: CoworkKind; name: string; color: string; language?: string; creator?: boolean }
type RoomOptions = { seed: string; onSignalingLost?: () => void }
export type CoworkSessionOptions = {
  makeRoom: (options: RoomOptions) => P2PRoom
  seed: string
  kind: CoworkKind
  name: string
  language?: string
  onKindMismatch?: () => void
  onError?: (error: Error) => void
  onIdentity?: (peerId: string) => void
  saveAsNote?: () => Promise<void>
}

export class CoworkSession {
  readonly state = reactive({ status: 'idle' as 'idle' | 'joining' | 'joined' | 'closed', banner: '', participants: [] as Participant[], language: '', roomId: '' })
  peerId = ''
  private room: P2PRoom | null = null
  private creator = false
  private creatorPeerId = ''
  private stopped = false
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private retryDelay = 1000
  private everJoined = false
  private frameListeners = new Set<(peerId: string, frame: RoomFrame) => void>()
  private peerListeners = new Set<(peerId: string, joined: boolean) => void>()

  constructor(private readonly options: CoworkSessionOptions) { this.state.language = options.language || '' }
  get status() { return this.state.status }
  get isCreator() { return this.creator }
  get roomId() { return this.state.roomId }
  get banner() { return this.state.banner }
  get participants() { return this.state.participants }
  get language() { return this.state.language }
  get currentRoom() { return this.room }

  onFrame(listener: (peerId: string, frame: RoomFrame) => void) { this.frameListeners.add(listener); return () => this.frameListeners.delete(listener) }
  onPeer(listener: (peerId: string, joined: boolean) => void) { this.peerListeners.add(listener); return () => this.peerListeners.delete(listener) }

  async create() {
    this.creator = true
    this.state.status = 'joining'
    const room = this.attachRoom()
    const grant = await room.create()
    this.state.roomId = grant.roomId
    this.peerId = grant.peerId
    this.creatorPeerId = grant.peerId
    this.options.onIdentity?.(grant.peerId)
    this.addPeer(grant.peerId, this.options.name, true)
    this.state.status = 'joined'
    this.everJoined = true
  }

  async join(roomId: string) {
    this.state.roomId = roomId
    this.state.status = 'joining'
    const room = this.attachRoom()
    const grant = await room.join(roomId)
    this.peerId = grant.peerId
    this.creatorPeerId = grant.peers[0] || ''
    this.options.onIdentity?.(grant.peerId)
    this.addPeer(grant.peerId, this.options.name, true)
    for (const id of grant.peers) this.addPeer(id, id, false)
    this.state.status = 'joined'
    this.everJoined = true
  }

  shareUrl(uiUrl: string, server?: string) {
    if (!this.roomId) throw new Error('Room not started')
    const base = uiUrl.endsWith('/') ? uiUrl : `${uiUrl}/`
    return `${base}c/${encodeURIComponent(this.roomId)}#${new FragmentData({ seed: this.options.seed, server, cryptoMode: 'gcm' }).toString()}`
  }

  async send(type: FrameType, payload: Uint8Array = new Uint8Array(), peerId?: string) {
    const data = encodeFrame(type, payload)
    if (peerId) await this.room?.send(peerId, data)
    else await this.room?.broadcast(data)
  }

  async setLanguage(language: string) {
    if (!this.creator) return
    this.state.language = language
    await this.sendHello()
  }

  signalingLost() { this.state.banner = SIGNALING_LOST }

  async saveAsNote() { await this.options.saveAsNote?.() }

  forgetPeer(peerId: string) { this.removePeer(peerId) }
  rememberPeer(peerId: string, name: string) { this.addPeer(peerId, name, true) }

  leave() {
    this.stopped = true
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    this.detachRoom()
    this.state.status = 'closed'
    this.state.banner = ''
    this.state.participants.splice(0)
  }

  private attachRoom() {
    const room = this.options.makeRoom({ seed: this.options.seed, onSignalingLost: () => { if (this.room === room) this.signalingLost() } })
    this.room = room
    room.onPeerJoined = (id) => {
      this.addPeer(id, this.participants.find(p => p.peerId === id)?.name || id, true)
      void this.sendHello(id).then(() => {
        if (this.room !== room || this.stopped) return
        for (const listener of this.peerListeners) listener(id, true)
      }).catch(error => this.options.onError?.(error as Error))
    }
    room.onPeerLeft = (id) => {
      this.removePeer(id)
      for (const listener of this.peerListeners) listener(id, false)
    }
    room.onMessage = (id, data) => {
      try {
        const frame = decodeFrame(data)
        if (frame.type === 0) this.receiveHello(id, frame.payload)
        else for (const listener of this.frameListeners) listener(id, frame)
      } catch (error) { this.options.onError?.(error as Error) }
    }
    room.onClose = (error) => {
      if (this.room !== room || this.stopped) return
      for (const peer of [...this.participants]) if (peer.peerId !== this.peerId) {
        this.removePeer(peer.peerId)
        for (const listener of this.peerListeners) listener(peer.peerId, false)
      }
      this.detachRoom()
      if (this.roomId && this.everJoined) this.scheduleRejoin()
      else { this.state.status = 'closed'; if (error) this.options.onError?.(error) }
    }
    return room
  }

  private detachRoom() {
    const room = this.room
    if (!room) return
    this.room = null
    room.onMessage = room.onPeerJoined = room.onPeerLeft = room.onClose = null
    room.leave()
  }

  private scheduleRejoin() {
    if (this.stopped || this.retryTimer) return
    this.state.status = 'joining'
    this.retryTimer = setTimeout(async () => {
      this.retryTimer = null
      if (this.stopped) return
      try {
        const room = this.attachRoom()
        const grant = await room.join(this.roomId)
        if (this.stopped) return
        this.peerId = grant.peerId
        this.creatorPeerId = this.creator ? grant.peerId : (grant.peers[0] || this.creatorPeerId)
        this.options.onIdentity?.(grant.peerId)
        this.state.participants.splice(0)
        this.addPeer(grant.peerId, this.options.name, true)
        for (const id of grant.peers) this.addPeer(id, id, false)
        this.state.status = 'joined'
        this.state.banner = ''
        this.retryDelay = 1000
      } catch (error) {
        this.detachRoom()
        if (this.retryTimer) clearTimeout(this.retryTimer)
        this.retryTimer = null
        const code = (error as { code?: string })?.code
        if (code === 'not-found' || code === 'session-full') {
          this.stopped = true
          this.state.status = 'closed'
          this.options.onError?.(error as Error)
          return
        }
        this.options.onError?.(error as Error)
        this.retryDelay = Math.min(this.retryDelay * 2, 30000)
        this.scheduleRejoin()
      }
    }, this.retryDelay)
  }

  private async sendHello(peerId?: string) {
    if (!this.peerId) return
    const hello: Hello = { v: 1, kind: this.options.kind, name: this.options.name, color: colorForPeer(this.peerId), creator: this.creator }
    if (this.language) hello.language = this.language
    await this.send(0, encoder.encode(JSON.stringify(hello)), peerId)
  }

  private receiveHello(peerId: string, payload: Uint8Array) {
    const hello = JSON.parse(decoder.decode(payload)) as Hello
    if (hello.v !== 1 || !['text', 'draw'].includes(hello.kind) || typeof hello.name !== 'string' || typeof hello.color !== 'string') throw new Error('Invalid cowork hello')
    if (hello.kind !== this.options.kind) {
      this.options.onKindMismatch?.()
      this.leave()
      return
    }
    this.addPeer(peerId, hello.name, true)
    // A rejoin gives the creator a new SDK peer ID; the role travels in each hello.
    if (!this.creator && hello.creator === true) this.creatorPeerId = peerId
    const fromCreator = hello.creator === true || (hello.creator === undefined && peerId === this.creatorPeerId)
    if (this.options.kind === 'text' && !this.creator && fromCreator && typeof hello.language === 'string') this.state.language = hello.language
  }

  private addPeer(peerId: string, name: string, connected: boolean) {
    const item = this.participants.find(p => p.peerId === peerId)
    if (item) { item.name = name; item.connected = connected }
    else this.participants.push({ peerId, name, color: colorForPeer(peerId), connected })
  }

  private removePeer(peerId: string) {
    const index = this.participants.findIndex(p => p.peerId === peerId)
    if (index !== -1) this.participants.splice(index, 1)
  }
}
