import { expect, test, type Page } from '@playwright/test'
import { APP_ORIGIN } from './helpers'

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true }

async function openTheme(page: Page) {
  await page.getByRole('heading', { name: 'About' }).click()
  await page.getByRole('button', { name: /^Theme/ }).click()
}

async function visit(page: Page, config: Record<string, string>, setting?: string) {
  await page.route('**/config.json', route => route.fulfill({ json: { baseURL: '/api/', drawURL: '', ...config } }))
  await page.route('**/api/info', route => route.fulfill({ json: info }))
  if (setting) await page.addInitScript(value => localStorage.setItem('settings', JSON.stringify({ version: 4, theme: value })), setting)
  await page.goto(`${APP_ORIGIN}/`)
}

test('raw operator CSS exposes Custom and injects one style', async ({ page }) => {
  await visit(page, { customCSS: ':root { --not3-bg: 210 0 0; }' })
  await openTheme(page)
  await page.getByRole('radio', { name: 'Custom' }).click()
  await expect(page.locator('style#not3-custom-css')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(210, 0, 0)')
  await openTheme(page)
  await expect(page.getByRole('radio', { name: 'Custom' })).toHaveAttribute('aria-checked', 'true')
})

test('operator default Custom has CSS at the first ready frame', async ({ page }) => {
  await page.addInitScript(() => {
    const setAttribute = Element.prototype.setAttribute
    Element.prototype.setAttribute = function (name: string, value: string) {
      setAttribute.call(this, name, value)
      if (name === 'data-theme-ready' && this === document.documentElement) {
        const target = window as typeof window & { __firstReady?: { styles: number; color: string } }
        target.__firstReady ??= {
          styles: document.querySelectorAll('style#not3-custom-css').length,
          color: document.body ? getComputedStyle(document.body).backgroundColor : '',
        }
      }
    }
  })
  await visit(page, { theme: 'custom', customCSS: ':root { --not3-bg: 210 0 0; }' })
  await page.waitForFunction(() => !!(window as typeof window & { __firstReady?: unknown }).__firstReady)
  expect(await page.evaluate(() => (window as typeof window & { __firstReady?: { styles: number; color: string } }).__firstReady)).toEqual({ styles: 1, color: 'rgb(210, 0, 0)' })
})

test('Custom URL stylesheet loads before the ready gate opens', async ({ page }) => {
  let release!: () => void
  const hold = new Promise<void>(resolve => { release = resolve })
  let requested = false
  await page.route('**/operator-custom.css', async route => {
    requested = true
    await hold
    await route.fulfill({ contentType: 'text/css', body: ':root { --not3-bg: 0 100 200; }' })
  })
  await page.route('**/config.json', route => route.fulfill({ json: { baseURL: '/api/', drawURL: '', theme: 'custom', customCSSURL: '/operator-custom.css' } }))
  await page.route('**/api/info', route => route.fulfill({ json: info }))
  await page.goto(`${APP_ORIGIN}/`, { waitUntil: 'commit' })
  await expect.poll(() => requested).toBe(true)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'custom', { timeout: 15_000 })
  await expect(page.locator('link#not3-custom-css')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-theme-ready'))).toBe(false)
  release()
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-theme-ready'))).toBe(true)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(0, 100, 200)')
})

test('failed Custom URL stylesheet releases the ready gate with fallback colors', async ({ page }) => {
  await page.route('**/operator-missing.css', route => route.abort())
  await visit(page, { theme: 'custom', customCSSURL: '/operator-missing.css' })
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-theme-ready'))).toBe(true)
  await expect(page.locator('link#not3-custom-css')).toHaveCount(1)
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
})

test('Custom URL stylesheet repaints an active progress canvas', async ({ page }) => {
  let releaseCss!: () => void
  const heldCss = new Promise<void>(resolve => { releaseCss = resolve })
  let cssRequested = false
  await page.route('**/operator-progress.css', async route => {
    cssRequested = true
    await heldCss
    await route.fulfill({ contentType: 'text/css', body: ':root { --not3-bg: 210 0 0; --not3-fg: 0 100 200; }' })
  })
  await page.route('**/api/file/upload', route => route.fulfill({ json: { id: 'probe-upload' } }))
  await page.route('**/api/file/upload/probe-upload**', async () => { await new Promise<void>(() => {}) })
  await visit(page, { customCSSURL: '/operator-progress.css' })
  await page.getByRole('heading', { name: 'Tools' }).click()
  await page.getByRole('button', { name: 'File Transfer' }).click()
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select File' }).click()
  await (await chooserPromise).setFiles({ name: 'progress.txt', mimeType: 'text/plain', buffer: Buffer.from('progress') })
  await page.getByRole('button', { name: 'Start Upload' }).click()
  const pixel = () => page.locator('canvas.w-full.h-full').evaluate(canvas => Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(8, 8, 1, 1).data))
  await expect.poll(pixel).toEqual([170, 170, 170, 255])
  await page.evaluate(() => {
    const app = (document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: { config: { globalProperties: { $pinia: { _s: Map<string, { theme: string }> } } } } }).__vue_app__
    const settings = app?.config.globalProperties.$pinia._s.get('settings')
    if (!settings) throw new Error('settings store not mounted')
    settings.theme = 'custom'
  })
  await expect.poll(() => cssRequested).toBe(true)
  releaseCss()
  await expect.poll(pixel).toEqual([70, 67, 133, 255])
})

test('URL CSS wins over raw CSS', async ({ page }) => {
  const url = 'data:text/css,:root%20%7B%20--not3-bg%3A%200%20100%20200%3B%20%7D'
  await visit(page, { customCSS: ':root { --not3-bg: 210 0 0; }', customCSSURL: url }, 'custom')
  await expect(page.locator('link#not3-custom-css')).toHaveCount(1)
  await expect(page.locator('style#not3-custom-css')).toHaveCount(0)
  await expect(page.locator('link#not3-custom-css')).toHaveAttribute('href', url)
})

test('stale Custom and empty CSS keys fall back to Default and hide Custom', async ({ page }) => {
  await visit(page, { customCSS: '', customCSSURL: '' }, 'custom')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'default')
  await expect(page.locator('#not3-custom-css')).toHaveCount(0)
  await openTheme(page)
  await expect(page.getByRole('radio', { name: 'Custom' })).toHaveCount(0)
  await expect(page.getByRole('radio', { name: 'Default', exact: true })).toHaveAttribute('aria-checked', 'true')
})

test('instance White applies initially; persisted Monokai wins and menu changes selection', async ({ page }) => {
  await visit(page, { theme: 'white' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'white')
  await openTheme(page)
  await expect(page.getByRole('radio', { name: 'Instance default' })).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('radio', { name: 'Monokai' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'monokai')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'monokai')
  await openTheme(page)
  await page.getByRole('radio', { name: 'Instance default' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'white')
})

test('rapid Custom and White switches leave one custom element, then none', async ({ page }) => {
  await visit(page, { customCSS: ':root { --not3-bg: 210 0 0; }' })
  for (const name of ['Custom', 'White', 'Custom']) {
    await openTheme(page)
    await page.getByRole('radio', { name }).click()
  }
  await expect(page.locator('#not3-custom-css')).toHaveCount(1)
  await openTheme(page)
  await page.getByRole('radio', { name: 'Default', exact: true }).click()
  await expect(page.locator('#not3-custom-css')).toHaveCount(0)
})

test('tools title bar places Back to editor before divider and content', async ({ page }) => {
  await visit(page, {})
  await page.getByRole('heading', { name: 'Tools', exact: true }).click()
  await page.getByRole('button', { name: 'Tools…' }).click()
  const header = page.locator('header').filter({ has: page.getByTitle('Back to the editor') })
  await expect(header).toBeVisible()
  await expect(header.locator('> *').nth(2)).toHaveAttribute('title', 'Back to the editor')
  await expect(header.locator('> *').nth(3)).toHaveClass(/border-l/)
})
