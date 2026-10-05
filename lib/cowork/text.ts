import * as Y from 'yjs'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import type { MonacoBinding } from 'y-monaco'
import type * as monaco from 'monaco-editor'
import type { FrameType, RoomFrame } from './session'

type Transport = {
  onFrame: (listener: (peer: string, frame: RoomFrame) => void) => () => void
  onPeer: (listener: (peer: string, joined: boolean) => void) => () => void
  send: (type: FrameType, payload: Uint8Array, peer?: string) => Promise<void>
}

type Options = { content: string; name: string; color: string; peerId: string; onContent?: (value: string) => void; onStalePeer?: (peerId: string) => void; onSeenPeer?: (peerId: string, name: string) => void }

export class CoworkText {
  readonly doc = new Y.Doc()
  readonly text = this.doc.getText('content')
  readonly awareness = new Awareness(this.doc)
  private readonly remoteClients = new Map<string, Set<number>>()
  private readonly lastSeen = new Map<string, number>()
  private readonly heartbeat: ReturnType<typeof setInterval>
  private readonly unsubscribeFrame: () => void
  private readonly unsubscribePeer: () => void
  private binding: MonacoBinding | null = null
  private style: HTMLStyleElement | null = null
  private disposed = false

  constructor(private readonly transport: Transport, private readonly options: Options) {
    if (options.content) this.text.insert(0, options.content)
    this.awareness.setLocalStateField('user', { peerId: options.peerId, name: options.name, color: options.color })
    this.text.observe(() => options.onContent?.(this.text.toString()))
    this.doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (this.disposed || typeof origin === 'string') return
      const out = encoding.createEncoder()
      syncProtocol.writeUpdate(out, update)
      void this.transport.send(1, encoding.toUint8Array(out))
    })
    this.awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      if (this.disposed || origin === 'remote') return
      const ids = [...added, ...updated, ...removed]
      if (ids.length) void this.transport.send(2, encodeAwarenessUpdate(this.awareness, ids))
    })
    this.awareness.on('change', () => this.updateCaretStyles())
    this.unsubscribeFrame = transport.onFrame((peer, frame) => this.receive(peer, frame))
    this.unsubscribePeer = transport.onPeer((peer, joined) => joined ? this.sync(peer) : this.removePeer(peer))
    this.heartbeat = setInterval(() => {
      if (this.disposed) return
      this.awareness.setLocalStateField('heartbeat', Date.now())
      for (const [peer, seen] of this.lastSeen) {
        if (Date.now() - seen > 4000) {
          this.removePeer(peer)
          this.options.onStalePeer?.(peer)
        }
      }
    }, 500)
  }

  setIdentity(peerId: string, color: string) {
    this.options.color = color
    this.awareness.setLocalStateField('user', { peerId, name: this.options.name, color: this.options.color })
  }

  sync(peerId: string) {
    const out = encoding.createEncoder()
    syncProtocol.writeSyncStep1(out, this.doc)
    void this.transport.send(1, encoding.toUint8Array(out), peerId)
    void this.transport.send(2, encodeAwarenessUpdate(this.awareness, [this.doc.clientID]), peerId)
  }

  private receive(peerId: string, frame: RoomFrame) {
    if (frame.type === 1) {
      const out = encoding.createEncoder()
      syncProtocol.readSyncMessage(decoding.createDecoder(frame.payload), out, this.doc, peerId)
      const response = encoding.toUint8Array(out)
      if (response.length) void this.transport.send(1, response, peerId)
    } else if (frame.type === 2) {
      applyAwarenessUpdate(this.awareness, frame.payload, 'remote')
      this.lastSeen.set(peerId, Date.now())
      const clients = this.remoteClients.get(peerId) || new Set<number>()
      for (const [id, state] of this.awareness.getStates()) if (state.user?.peerId === peerId) {
        clients.add(id)
        this.options.onSeenPeer?.(peerId, String(state.user.name || peerId))
      }
      this.remoteClients.set(peerId, clients)
    }
  }

  removePeer(peerId: string) {
    this.lastSeen.delete(peerId)
    const clients = [...(this.remoteClients.get(peerId) || [])]
    this.remoteClients.delete(peerId)
    if (clients.length) removeAwarenessStates(this.awareness, clients, 'remote')
  }

  async bindMonaco(model: monaco.editor.ITextModel, editor: monaco.editor.IStandaloneCodeEditor): Promise<() => void> {
    const { MonacoBinding } = await import('y-monaco')
    this.binding?.destroy()
    this.binding = new MonacoBinding(this.text, model, new Set([editor]), this.awareness)
    this.style?.remove()
    this.style = document.createElement('style')
    document.head.append(this.style)
    this.updateCaretStyles()
    return () => { this.binding?.destroy(); this.binding = null; this.style?.remove(); this.style = null }
  }

  private updateCaretStyles() {
    if (!this.style) return
    const rules: string[] = []
    for (const [id, state] of this.awareness.getStates()) {
      if (id === this.doc.clientID || !state.user) continue
      const color = /^#[\da-fA-F]{3,8}$/.test(state.user.color) ? state.user.color : '#38bdf8'
      const name = JSON.stringify(String(state.user.name || 'Guest')).replace(/</g, '\\3c ')
      rules.push(`.yRemoteSelection-${id}{background:${color}44}.yRemoteSelectionHead-${id}{border-left:2px solid ${color}}.yRemoteSelectionHead-${id}:after{content:${name};position:absolute;background:${color};color:#111;padding:1px 3px;font-size:11px;white-space:nowrap;z-index:10}`)
    }
    this.style.textContent = rules.join('\n')
  }

  destroy() {
    this.disposed = true
    clearInterval(this.heartbeat)
    this.unsubscribeFrame()
    this.unsubscribePeer()
    this.binding?.destroy()
    this.style?.remove()
    this.awareness.destroy()
    this.doc.destroy()
  }
}
