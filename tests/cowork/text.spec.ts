import { expect, test, type BrowserContext, type Page } from '@playwright/test'

async function openContext(browser: import('@playwright/test').Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext()
  await context.route('**/config.json', route => route.fulfill({ json: { baseURL: 'http://127.0.0.1:18890/', drawURL: '' } }))
  const page = await context.newPage()
  return { context, page }
}

async function nameParticipant(page: Page, name: string) {
  await expect(page.getByText('Choose the name other participants will see.')).toBeVisible()
  await page.locator('.dialog-content input').fill(name)
  await page.getByRole('button', { name: 'Submit' }).click()
}

async function edit(page: Page, text: string) {
  await page.locator('.monaco-editor .view-lines').first().click()
  await page.keyboard.type(text)
}

async function expectEditor(page: Page, text: string) {
  await expect.poll(async () => (await page.locator('.monaco-editor .view-line').allTextContents()).join('\n').replaceAll('\u00a0', ' ')).toContain(text)
}

async function editorText(page: Page) {
  return (await page.locator('.monaco-editor .view-line').allTextContents()).join('\n').replaceAll('\u00a0', ' ')
}

test('two browsers typing concurrently converge on both edits', async ({ browser }) => {
  const alice = await openContext(browser)
  const bob = await openContext(browser)
  try {
    await alice.page.goto('/')
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await nameParticipant(alice.page, 'Alice')
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()
    await bob.page.goto(link)
    await nameParticipant(bob.page, 'Bob')
    await expect(alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]')).toBeVisible()
    await Promise.all([edit(alice.page, 'alpha'), edit(bob.page, 'bravo')])
    for (const page of [alice.page, bob.page]) {
      await expect.poll(() => editorText(page)).toContain('alpha')
      await expect.poll(() => editorText(page)).toContain('bravo')
    }
    await expect.poll(() => editorText(alice.page)).toBe(await editorText(bob.page))
  } finally { await alice.context.close(); await bob.context.close() }
})

test('three peers converge, remove a caret, and save a snapshot while editing continues', async ({ browser }) => {
  const alice = await openContext(browser)
  const bob = await openContext(browser)
  const cara = await openContext(browser)
  try {
    await alice.page.goto('/')
    await expect(alice.page.getByRole('button', { name: 'Start cowork' })).toBeVisible({ timeout: 15000 })
    await edit(alice.page, 'First line')
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await nameParticipant(alice.page, 'Alice')
    const link = await alice.page.getByTestId('cowork-link').textContent()
    expect(link).toContain('/c/')
    expect(new URL(link!).search).toBe('')
    expect(new URL(link!).hash.length).toBeGreaterThan(1)
    await expect.poll(async () => alice.page.getByLabel('Cowork QR code').evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(0)
    await alice.page.getByRole('button', { name: 'Close' }).click()

    await bob.page.goto(link!)
    await nameParticipant(bob.page, 'Bob')
    await expectEditor(bob.page, 'First line')
    await expect(bob.page.locator('select').first()).toBeDisabled()
    await alice.page.locator('select').first().selectOption('python')
    await expect(bob.page.locator('select').first()).toHaveValue('python')
    await alice.page.locator('select').first().selectOption('auto')
    await expect(bob.page.locator('select').first()).toHaveValue('plaintext')
    await edit(bob.page, ' from Bob')
    await expectEditor(alice.page, 'First line from Bob')
    await expect(alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]')).toBeVisible()
    await expect.poll(async () => alice.page.locator('.yRemoteSelectionHead').count()).toBeGreaterThan(0)
    await expect.poll(async () => alice.page.locator('.yRemoteSelectionHead').evaluateAll(elements => elements.map(element => getComputedStyle(element, '::after').content).join(' '))).toContain('Bob')

    await cara.page.goto(link!)
    await nameParticipant(cara.page, 'Cara')
    await expectEditor(cara.page, 'First line from Bob')

    await bob.context.close()
    await expect.poll(async () => alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]').count(), { timeout: 5000 }).toBe(0)
    await expect.poll(async () => alice.page.locator('.yRemoteSelectionHead').evaluateAll(elements => elements.map(element => getComputedStyle(element, '::after').content).join(' ')), { timeout: 5000 }).not.toContain('Bob')

    await alice.page.getByRole('button', { name: 'Save as note' }).first().click()
    const snapshot = await alice.page.locator('.dialog-content input[readonly]').inputValue()
    expect(new URL(snapshot).pathname).toMatch(/\/q\//)
    await alice.page.getByRole('button', { name: 'Ok' }).click()
    await edit(cara.page, ' and Cara')
    await expectEditor(alice.page, 'First line from Bob and Cara')

    const saved = await openContext(browser)
    try {
      await saved.page.goto(snapshot)
      await expectEditor(saved.page, 'First line from Bob')
    } finally { await saved.context.close() }
  } finally {
    await alice.context.close()
    await cara.context.close()
  }
})

test('an expired room offers the plain note escape hatch', async ({ browser }) => {
  const visitor = await openContext(browser)
  try {
    const seed = Buffer.alloc(32, 1).toString('base64')
    const fragment = Buffer.from(new URLSearchParams({ k: seed, m: 'gcm' }).toString()).toString('base64')
    await visitor.page.goto(`/c/missing#${fragment}`)
    await nameParticipant(visitor.page, 'Visitor')
    await expect(visitor.page.getByText('Session not found')).toBeVisible()
    await visitor.page.getByRole('button', { name: 'Copy content and open as plain note' }).click()
    await expect(visitor.page).toHaveURL('http://127.0.0.1:18889/')
  } finally { await visitor.context.close() }
})

test('an expired room after editing offers recovery without losing content', async ({ browser, request }) => {
  const alice = await openContext(browser)
  try {
    await alice.page.goto('/')
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await nameParticipant(alice.page, 'Alice')
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()
    await edit(alice.page, 'Keep this draft')
    const roomId = new URL(link).pathname.split('/').at(-1)!
    expect((await request.post('http://127.0.0.1:18890/test/expire-room', { data: { roomId } })).ok()).toBe(true)
    await expect(alice.page.getByText('Session not found')).toBeVisible({ timeout: 10000 })
    await alice.page.getByRole('button', { name: 'Copy content and open as plain note' }).click()
    await expect(alice.page).toHaveURL('http://127.0.0.1:18889/')
    await expectEditor(alice.page, 'Keep this draft')
  } finally { await alice.context.close() }
})

test('a custom cowork server asks for the same trust decision as a note', async ({ browser }) => {
  const visitor = await openContext(browser)
  try {
    const seed = Buffer.alloc(32, 2).toString('base64')
    const fragment = Buffer.from(new URLSearchParams({ k: seed, m: 'gcm', s: 'http://127.0.0.1:18890/' }).toString()).toString('base64')
    await visitor.page.goto(`/c/missing#${fragment}`)
    await expect(visitor.page.getByText('Do you trust this server?')).toBeVisible()
    await visitor.page.getByRole('button', { name: 'No' }).click()
    await expect(visitor.page).toHaveURL('http://127.0.0.1:18889/')
  } finally { await visitor.context.close() }
})

test('connected peers keep editing when signaling is lost', async ({ browser, request }) => {
  const alice = await openContext(browser)
  const bob = await openContext(browser)
  try {
    await alice.page.goto('/')
    await alice.page.getByRole('button', { name: 'Start cowork' }).click()
    await nameParticipant(alice.page, 'Alice')
    const link = (await alice.page.getByTestId('cowork-link').textContent())!
    await alice.page.getByRole('button', { name: 'Close' }).click()
    await bob.page.goto(link)
    await nameParticipant(bob.page, 'Bob')
    await expect(alice.page.getByRole('button', { name: 'Cowork participants' }).locator('[title="Bob"]')).toBeVisible()
    const roomId = new URL(link).pathname.split('/').at(-1)!
    expect((await request.post('http://127.0.0.1:18890/test/drop-signaling', { data: { roomId } })).ok()).toBe(true)
    await expect(alice.page.getByText('Connection to server lost: current participants can keep working, new ones cannot join')).toBeVisible()
    await edit(bob.page, 'still together')
    await expectEditor(alice.page, 'still together')
  } finally { await alice.context.close(); await bob.context.close() }
})
