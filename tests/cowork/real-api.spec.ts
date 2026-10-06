import { expect, test, type Browser, type Page } from '@playwright/test'
import WebSocket from 'ws'

const api = 'http://127.0.0.1:18892/'
const gateway = 'ws://127.0.0.1:18892/p2p'

test.skip(!process.env.COWORK_REAL_API, 'Start the sibling API with P2P_ENABLED=true and set COWORK_REAL_API=1')

async function openPeer(browser: Browser) {
  const context = await browser.newContext()
  await context.route('**/config.json', route => route.fulfill({ json: { baseURL: api, drawURL: '' } }))
  await context.addInitScript(() => {
    const Original = window.WebSocket
    const signaling: WebSocket[] = []
    const gatewayFrames: { type: string }[] = []
    Object.assign(window, { coworkSignaling: signaling, coworkGatewayFrames: gatewayFrames })
    class TrackedSocket extends Original {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols)
        if (String(url).includes('/p2p')) {
          signaling.push(this)
          this.addEventListener('message', event => {
            try { gatewayFrames.push(JSON.parse(String(event.data))) } catch { /* Ignore malformed frames in this probe. */ }
          })
        }
      }
    }
    window.WebSocket = TrackedSocket
  })
  return { context, page: await context.newPage() }
}

async function name(page: Page, value: string) {
  await expect(page.getByText('Choose the name other participants will see.')).toBeVisible()
  await page.locator('.dialog-content input').fill(value)
  await page.getByRole('button', { name: 'Submit' }).click()
}

async function edit(page: Page, value: string) {
  await page.locator('.monaco-editor .view-lines').first().click()
  await page.keyboard.type(value)
}

async function editorText(page: Page) {
  return (await page.locator('.monaco-editor .view-line').allTextContents()).join(' ').replaceAll('\u00a0', ' ')
}

async function openSocket(frame: object): Promise<{ socket: WebSocket; reply: { type: string; sessionId?: string; code?: string } }> {
  const socket = new WebSocket(gateway)
  const reply = await new Promise<{ type: string; sessionId?: string; code?: string }>((resolve, reject) => {
    socket.once('error', reject)
    socket.once('open', () => socket.send(JSON.stringify(frame)))
    socket.once('message', data => resolve(JSON.parse(String(data))))
  })
  return { socket, reply }
}

test('published SDK and real gateway preserve live text, isolate wrong seeds, enforce capacity, and report signaling loss', async ({ browser }) => {
  test.setTimeout(180_000)
  const alice = await openPeer(browser)
  const bob = await openPeer(browser)
  const wrong = await openPeer(browser)
  const missing = await openPeer(browser)
  const full = await openPeer(browser)
  const sockets: WebSocket[] = []
  try {
    const info = await alice.page.request.get(`${api}info`)
    expect(info.ok()).toBe(true)
    expect((await info.json()).p2pRooms).toBe(true)
    await alice.page.goto('/')
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await name(alice.page, 'Alice')
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()
    await bob.page.goto(link)
    await name(bob.page, 'Bob')
    await expect(alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]')).toBeVisible()
    await edit(alice.page, 'real gateway')
    await expect.poll(() => editorText(bob.page)).toContain('real gateway')

    const badLink = new URL(link)
    const data = new URLSearchParams(Buffer.from(badLink.hash.slice(1), 'base64').toString())
    data.set('k', Buffer.alloc(32, 7).toString('base64'))
    badLink.hash = Buffer.from(data.toString()).toString('base64')
    await wrong.page.goto(badLink.href)
    await name(wrong.page, 'Wrong seed')
    await expect.poll(() => wrong.page.evaluate(() => (window as typeof window & { coworkGatewayFrames: { type: string }[] }).coworkGatewayFrames.some(frame => frame.type === 'joined'))).toBe(true)
    await expect.poll(() => wrong.page.evaluate(() => (window as typeof window & { coworkGatewayFrames: { type: string }[] }).coworkGatewayFrames.some(frame => frame.type === 'signal'))).toBe(true)
    await expect.poll(async () => alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Wrong seed"]').count()).toBe(0)
    await edit(bob.page, ' stays private')
    await expect.poll(() => editorText(alice.page)).toContain('stays private')

    const missingLink = new URL(link)
    missingLink.pathname = '/c/no-such-room'
    await missing.page.goto(missingLink.href)
    await name(missing.page, 'Missing')
    await expect(missing.page.getByText('Session not found')).toBeVisible()

    const created = await openSocket({ type: 'create', kind: 'room' })
    sockets.push(created.socket)
    expect(created.reply.type).toBe('created')
    const roomId = created.reply.sessionId!
    for (let i = 0; i < 7; i++) {
      const joined = await openSocket({ type: 'join', sessionId: roomId })
      sockets.push(joined.socket)
      expect(joined.reply.type).toBe('joined')
    }
    const fullLink = new URL(link)
    fullLink.pathname = `/c/${roomId}`
    await full.page.goto(fullLink.href)
    await name(full.page, 'Ninth member')
    await expect(full.page.getByText('Session full')).toBeVisible()
    await expect(full.page.getByRole('button', { name: 'Copy content and open as plain note' })).toBeVisible()
    const ninth = await openSocket({ type: 'join', sessionId: roomId })
    sockets.push(ninth.socket)
    expect(ninth.reply).toMatchObject({ type: 'error', code: 'session-full' })

    await Promise.all([alice.page, bob.page].map(page => page.evaluate(() => {
      for (const socket of (window as typeof window & { coworkSignaling: WebSocket[] }).coworkSignaling) socket.close()
    })))
    await expect(alice.page.getByText('Connection to server lost: current participants can keep working, new ones cannot join')).toBeVisible()
    await edit(bob.page, ' after signaling loss')
    await expect.poll(() => editorText(alice.page)).toContain('after signaling loss')
  } finally {
    for (const socket of sockets) socket.close()
    await Promise.all([alice, bob, wrong, missing, full].map(peer => peer.context.close().catch(() => {})))
  }
})
