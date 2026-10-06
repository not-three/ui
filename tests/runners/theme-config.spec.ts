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
