import { expect, test, type Browser, type BrowserContext, type FrameLocator, type Page } from '@playwright/test'

type Peer = { context: BrowserContext; page: Page; frame: FrameLocator }

async function openPeer(browser: Browser): Promise<Peer> {
  const context = await browser.newContext()
  await context.route('**/config.json', route => route.fulfill({ json: { baseURL: 'http://127.0.0.1:18890/', drawURL: 'http://127.0.0.1:18891/' } }))
  await context.addInitScript(() => {
    const messages: unknown[] = []
    Object.assign(window, { coworkMessages: messages })
    window.addEventListener('message', event => {
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
    await expect.poll(async () => (await messages(bob)).some(message => message.type === 'not3/draw/collab/elements' && (message.payload.elements as { type: string }[])?.some(element => element.type === 'rectangle'))).toBe(true)
    await alice.page.mouse.move(x + 110, y + 70)
    await expect.poll(async () => (await messages(bob)).some(message => message.type === 'not3/draw/collab/pointers' && (message.payload.peers as { name: string; pointer: unknown }[])?.some(peer => peer.name === 'Alice' && peer.pointer))).toBe(true)

    await cara.page.goto(link)
    await namePeer(cara.page, 'Cara')
    await ready(cara)
    await expect.poll(async () => (await messages(cara)).some(message => message.type === 'not3/draw/collab/elements' && (message.payload.elements as { type: string }[])?.some(element => element.type === 'rectangle'))).toBe(true)

    await bob.page.getByRole('button', { name: 'Save as note' }).first().click()
    const savedLink = await bob.page.locator('.dialog-content input[readonly]').inputValue()
    expect(new URL(savedLink).pathname).toMatch(/\/q\//)
    await bob.page.getByRole('button', { name: 'Ok' }).click()
    await expect(bob.page.getByRole('button', { name: 'Cowork participants' })).toBeVisible()
    const saved = await openPeer(browser)
    try {
      await saved.page.goto(savedLink)
      await expect.poll(async () => (await saved.frame.locator('body').evaluate(() => (window as typeof window & { coworkMessages: { type: string; payload: { content?: { type: string }[] } }[] }).coworkMessages || [])).some(message => message.type === 'not3/draw/init' && message.payload.content?.some(element => element.type === 'rectangle'))).toBe(true)
    } finally { await saved.context.close() }
  } finally {
    await alice.context.close().catch(() => {})
    await bob.context.close().catch(() => {})
    await cara.context.close().catch(() => {})
  }
})
