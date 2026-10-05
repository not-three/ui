import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { WebSocketServer } from 'ws'

const rooms = new Map()
const notes = new Map()
const wss = new WebSocketServer({ noServer: true })

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' })
  res.end(JSON.stringify(body))
}

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (path === '/info') return json(res, 200, { version: '2.5.0', p2pRooms: true, p2pEnabled: true, fileTransferEnabled: true, maxStorageTimeDays: 30 })
  if (path === '/test/drop-signaling' && req.method === 'POST') {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const room = rooms.get(JSON.parse(raw).roomId)
    if (!room) return json(res, 404, { error: 'not-found' })
    for (const peer of room.values()) peer.close()
    return json(res, 200, { ok: true })
  }
  if (path === '/note/json' && req.method === 'POST') {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const id = randomUUID()
    notes.set(id, { ...JSON.parse(raw), expiresAt: Math.floor(Date.now() / 1000) + 3600 })
    return json(res, 200, { id, deleteToken: 'fake' })
  }
  const note = path.match(/^\/note\/([^/]+)\/json$/)
  if (note && notes.has(note[1])) return json(res, 200, notes.get(note[1]))
  return json(res, 404, { error: 'not-found' })
})

server.on('upgrade', (request, socket, head) => {
  if (new URL(request.url, 'http://localhost').pathname !== '/p2p') return socket.destroy()
  wss.handleUpgrade(request, socket, head, ws => wss.emit('connection', ws))
})

wss.on('connection', ws => {
  let roomId = null
  let peerId = null
  const send = frame => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(frame)) }
  function leave() {
    if (!roomId || !peerId) return
    const room = rooms.get(roomId)
    room?.delete(peerId)
    for (const peer of room?.values() || []) peer.send(JSON.stringify({ type: 'peer-left', peerId }))
    if (!room?.size) rooms.delete(roomId)
    roomId = peerId = null
  }
  ws.on('message', raw => {
    let frame
    try { frame = JSON.parse(String(raw)) } catch { return send({ type: 'error', code: 'invalid-message' }) }
    if (frame.type === 'create' && frame.kind === 'room') {
      roomId = randomUUID()
      peerId = randomUUID()
      rooms.set(roomId, new Map([[peerId, ws]]))
      send({ type: 'created', sessionId: roomId, peerId, kind: 'room', iceServers: [] })
    } else if (frame.type === 'join') {
      const room = rooms.get(frame.sessionId)
      if (!room) return send({ type: 'error', code: 'not-found' })
      if (room.size >= 8) return send({ type: 'error', code: 'session-full' })
      roomId = frame.sessionId
      peerId = randomUUID()
      const peers = [...room.keys()]
      room.set(peerId, ws)
      send({ type: 'joined', sessionId: roomId, peerId, peers, kind: 'room', iceServers: [] })
      for (const id of peers) room.get(id).send(JSON.stringify({ type: 'peer-joined', peerId }))
    } else if (frame.type === 'signal' && roomId && peerId) {
      const target = rooms.get(roomId)?.get(frame.to)
      if (target) target.send(JSON.stringify({ type: 'signal', from: peerId, payload: frame.payload }))
    } else if (frame.type === 'leave') {
      leave()
      ws.close()
    }
  })
  ws.on('close', leave)
})

server.listen(18890, '127.0.0.1')
