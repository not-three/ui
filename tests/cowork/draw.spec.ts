import { expect, test, type Browser, type BrowserContext, type FrameLocator, type Page } from '@playwright/test'

type Peer = { context: BrowserContext; page: Page; frame: FrameLocator }
type SceneElement = { id: string; type: string; index: string | null; version: number; versionNonce: number; isDeleted: boolean }

async function openPeer(browser: Browser): Promise<Peer> {
  const context = await browser.newContext()
  await context.route('**/config.json', route => route.fulfill({ json: { baseURL: 'http://127.0.0.1:18890/', drawURL: 'http://127.0.0.1:18891/' } }))
  await context.addInitScript(() => {
    const messages: unknown[] = []
    const capture: { resolve?: (elements: SceneElement[]) => void } = {}
    Object.assign(window, { coworkMessages: messages, coworkSceneCapture: capture })
    window.addEventListener('message', event => {
      if (event.data?.type === 'not3/draw/collab/scene' && capture.resolve) {
        const resolve = capture.resolve
        capture.resolve = undefined
        event.stopImmediatePropagation()
        resolve(event.data.payload.elements)
        return
      }
      if (event.data?.type?.startsWith('not3/draw/')) messages.push(event.data)
    })
  })
  const page = await context.newPage()
  return { context, page, frame: page.frameLocator('iframe[src="http://127.0.0.1:18891/"]') }
}

async function namePeer(page: Page, name: string) {
  await expect(page.getByText('Choose the name other participants will see.')).toBeVisible()
  await page.locator('.dialog-content input').fill(name)
  await page.getByRole('button', { name: 'Submit' }).click()
}

async function messages(peer: Peer): Promise<{ type: string; payload: Record<string, unknown> }[]> {
  return peer.frame.locator('body').evaluate(() => (window as typeof window & { coworkMessages: { type: string; payload: Record<string, unknown> }[] }).coworkMessages)
}

async function ready(peer: Peer, collab = true) {
  await expect(peer.frame.locator('.excalidraw')).toBeVisible({ timeout: 30000 })
  if (collab) await expect.poll(async () => (await messages(peer)).some(message => message.type === 'not3/draw/collab/start')).toBe(true)
}

async function scene(peer: Peer): Promise<SceneElement[]> {
  return peer.page.locator('iframe[src="http://127.0.0.1:18891/"]').evaluate(iframe => new Promise<SceneElement[]>((resolve, reject) => {
    const child = (iframe as HTMLIFrameElement).contentWindow!
    const capture = (window as typeof window & { coworkSceneCapture: { resolve?: (elements: SceneElement[]) => void } }).coworkSceneCapture
    const timer = setTimeout(() => { capture.resolve = undefined; reject(new Error('Timed out waiting for iframe scene')) }, 5000)
    capture.resolve = elements => { clearTimeout(timer); resolve(elements) }
    child.postMessage({ type: 'not3/draw/collab/scene-request', payload: {} }, '*')
  }))
}

async function drawRectangle(peer: Peer, offset: number) {
  await peer.frame.locator('[data-testid="toolbar-rectangle"]').locator('..').click()
  const box = await peer.frame.locator('.excalidraw').boundingBox()
  expect(box).not.toBeNull()
  const x = box!.x + box!.width / 2 + offset
  const y = box!.y + box!.height / 2 + offset
  await peer.page.mouse.move(x, y)
  await peer.page.mouse.down()
  await peer.page.mouse.move(x + 45, y + 35, { steps: 4 })
  await peer.page.mouse.up()
}

async function injectElement(peer: Peer, element: SceneElement) {
  const previous = await peer.page.evaluate(() => (window as typeof window & { coworkMessages: { type: string }[] }).coworkMessages.filter(message => message.type === 'not3/draw/collab/delta').length)
  await peer.frame.locator('body').evaluate((_, update) => {
    window.dispatchEvent(new MessageEvent('message', { source: window.parent, data: { type: 'not3/draw/collab/elements', payload: { elements: [update] } } }))
    window.parent.postMessage({ type: 'not3/draw/collab/delta', payload: { elements: [update] } }, '*')
  }, element)
  await expect.poll(async () => peer.page.evaluate(() => (window as typeof window & { coworkMessages: { type: string }[] }).coworkMessages.filter(message => message.type === 'not3/draw/collab/delta').length)).toBeGreaterThan(previous)
  await expect.poll(async () => (await scene(peer)).find(item => item.id === element.id)?.version).toBeGreaterThanOrEqual(element.version)
}

test('drawing, named pointer, late scene, and saved snapshot cross three browsers', async ({ browser }) => {
  test.setTimeout(120_000)
  const alice = await openPeer(browser)
  const bob = await openPeer(browser)
  const cara = await openPeer(browser)
  try {
    await alice.page.goto('/')
    await expect(alice.page.getByRole('button', { name: 'Start cowork' })).toBeVisible({ timeout: 15000 })
    await alice.page.getByText('Tools', { exact: true }).click()
    await alice.page.getByRole('button', { name: 'Open Excalidraw' }).click()
    await ready(alice, false)
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await namePeer(alice.page, 'Alice')
    await ready(alice)
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()

    await bob.page.goto(link)
    await namePeer(bob.page, 'Bob')
    await ready(bob)
    await expect(alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]')).toBeVisible()

    await alice.frame.locator('[data-testid="toolbar-rectangle"]').locator('..').click()
    const canvas = alice.frame.locator('.excalidraw')
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    const x = box!.x + box!.width / 2, y = box!.y + box!.height / 2
    await alice.page.mouse.move(x, y)
    await alice.page.mouse.down()
    await alice.page.mouse.move(x + 90, y + 60, { steps: 5 })
    await alice.page.mouse.up()
    await expect.poll(async () => (await scene(bob)).some(element => element.type === 'rectangle' && !element.isDeleted)).toBe(true)
    await alice.page.mouse.move(x + 110, y + 70)
    await expect.poll(async () => (await messages(bob)).some(message => message.type === 'not3/draw/collab/pointers' && (message.payload.peers as { name: string; pointer: unknown }[])?.some(peer => peer.name === 'Alice' && peer.pointer))).toBe(true)

    await cara.page.goto(link)
    await namePeer(cara.page, 'Cara')
    await ready(cara)
    await expect.poll(async () => (await scene(cara)).some(element => element.type === 'rectangle' && !element.isDeleted)).toBe(true)

    await bob.page.getByRole('button', { name: 'Save as note' }).first().click()
    const savedLink = await bob.page.locator('.dialog-content input[readonly]').inputValue()
    expect(new URL(savedLink).pathname).toMatch(/\/q\//)
    await bob.page.getByRole('button', { name: 'Ok' }).click()
    await expect(bob.page.getByRole('button', { name: 'Cowork participants' })).toBeVisible()
    await drawRectangle(bob, 110)
    await expect.poll(async () => (await scene(alice)).filter(element => element.type === 'rectangle' && !element.isDeleted).length).toBe(2)
    const saved = await openPeer(browser)
    try {
      await saved.page.goto(savedLink)
      await expect.poll(async () => (await saved.frame.locator('body').evaluate(() => (window as typeof window & { coworkMessages: { type: string; payload: { content?: { type: string }[] } }[] }).coworkMessages || [])).find(message => message.type === 'not3/draw/init')?.payload.content?.filter(element => element.type === 'rectangle').length).toBe(1)
    } finally { await saved.context.close() }
  } finally {
    await alice.context.close().catch(() => {})
    await bob.context.close().catch(() => {})
    await cara.context.close().catch(() => {})
  }
})

test('interleaved drawings converge in actual iframe scene order with mixed indices and concurrent edits', async ({ browser }) => {
  test.setTimeout(150_000)
  const alice = await openPeer(browser)
  const bob = await openPeer(browser)
  try {
    await alice.page.goto('/')
    await alice.page.getByText('Tools', { exact: true }).click()
    await alice.page.getByRole('button', { name: 'Open Excalidraw' }).click()
    await ready(alice, false)
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await namePeer(alice.page, 'Alice')
    await ready(alice)
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()
    await bob.page.goto(link)
    await namePeer(bob.page, 'Bob')
    await ready(bob)

    for (const [peer, offset] of [[alice, -100], [bob, -30], [alice, 40], [bob, 110]] as const) {
      await drawRectangle(peer, offset)
      await expect.poll(async () => (await scene(alice)).filter(item => item.type === 'rectangle' && !item.isDeleted).length).toBe([[-100, 1], [-30, 2], [40, 3], [110, 4]].find(([key]) => key === offset)![1])
      await expect.poll(async () => (await scene(bob)).filter(item => item.type === 'rectangle' && !item.isDeleted).length).toBe([[-100, 1], [-30, 2], [40, 3], [110, 4]].find(([key]) => key === offset)![1])
    }
    const before = await scene(alice)
    expect(before.filter(item => item.type === 'rectangle')).toHaveLength(4)
    expect(before.some(item => typeof item.index === 'string')).toBe(true)
    const first = before.find(item => item.type === 'rectangle')!
    const last = before.filter(item => item.type === 'rectangle').at(-1)!
    await injectElement(alice, { ...first, index: null, version: first.version + 1, versionNonce: 100 })
    await injectElement(bob, { ...last, index: null, version: last.version + 1, versionNonce: 101 })
    for (const peer of [alice, bob]) {
      await expect.poll(async () => (await scene(peer)).find(item => item.id === first.id)?.version).toBeGreaterThanOrEqual(first.version + 1)
      await expect.poll(async () => (await scene(peer)).find(item => item.id === last.id)?.version).toBeGreaterThanOrEqual(last.version + 1)
    }
    expect((await scene(alice)).map(item => item.id)).toEqual((await scene(bob)).map(item => item.id))

    const shared = (await scene(alice)).find(item => item.id === first.id)!
    const aliceEdit = { ...shared, version: shared.version + 1, versionNonce: 20, isDeleted: false }
    const bobEdit = { ...shared, version: shared.version + 1, versionNonce: 10, isDeleted: false }
    await Promise.all([injectElement(alice, aliceEdit), injectElement(bob, bobEdit)])
    await expect.poll(async () => (await scene(alice)).find(item => item.id === first.id)?.versionNonce).toBe(10)
    await expect.poll(async () => (await scene(bob)).find(item => item.id === first.id)?.versionNonce).toBe(10)
    const deleted = { ...bobEdit, version: bobEdit.version + 1, versionNonce: 5, isDeleted: true }
    await injectElement(alice, deleted)
    await expect.poll(async () => (await scene(bob)).find(item => item.id === first.id)?.isDeleted).toBe(true)
  } finally {
    await alice.context.close().catch(() => {})
    await bob.context.close().catch(() => {})
  }
})
