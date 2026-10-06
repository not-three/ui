import { expect, test, type Page } from '@playwright/test';
import { APP_ORIGIN } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true };

async function app(page: Page) {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
}

async function selectTheme(page: Page, theme: string) {
  await page.evaluate(id => {
    const app = (document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: { config: { globalProperties: { $pinia: { _s: Map<string, { theme: string }> } } } } }).__vue_app__;
    const settings = app?.config.globalProperties.$pinia._s.get('settings');
    if (!settings) throw new Error('settings store not mounted');
    settings.theme = id;
  }, theme);
}

test('persisted Monokai colors the body by DOMContentLoaded', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('settings', JSON.stringify({ theme: 'monokai' }));
    document.addEventListener('DOMContentLoaded', () => {
      (window as Window & { __bodyAtDOMContentLoaded?: string }).__bodyAtDOMContentLoaded = getComputedStyle(document.body).backgroundColor;
    });
  });
  await app(page);
  expect(await page.evaluate(() => (window as Window & { __bodyAtDOMContentLoaded?: string }).__bodyAtDOMContentLoaded)).toBe('rgb(39, 40, 34)');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'monokai');
});

test('first visible application paint uses operator White', async ({ page }) => {
  await page.route('**/config.json', route => route.fulfill({ json: { baseURL: '/api/', theme: 'white' } }));
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const sample = () => {
        if (getComputedStyle(document.body).visibility === 'visible') {
          (window as Window & { __firstVisibleColor?: string }).__firstVisibleColor = getComputedStyle(document.body).backgroundColor;
        } else requestAnimationFrame(sample);
      };
      sample();
    });
  });
  await app(page);
  expect(await page.evaluate(() => (window as Window & { __firstVisibleColor?: string }).__firstVisibleColor)).toBe('rgb(255, 255, 255)');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
});

test('switching to White updates the page and Monaco', async ({ page }) => {
  await app(page);
  await selectTheme(page, 'white');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.monaco-editor').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('White passes a light scheme into the markdown sandbox', async ({ page }) => {
  await app(page);
  await selectTheme(page, 'white');
  await page.locator('select').first().selectOption('markdown');
  await page.getByRole('button', { name: 'Run', exact: true }).first().click();
  const preview = page.frameLocator('iframe').locator('.markdown-preview');
  await expect(preview).toHaveAttribute('data-theme', 'light');
  await expect(preview).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('tool output Monaco follows White and a live switch to Monokai', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('settings', JSON.stringify({ version: 4, theme: 'white' })));
  await page.goto(`${APP_ORIGIN}/t/timestamp`);
  const panel = page.getByRole('region', { name: 'Timestamp tool' });
  await panel.getByLabel('Input source').getByRole('radio', { name: 'Text' }).click();
  await panel.getByRole('textbox', { name: 'Input text' }).fill('0');
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  const output = panel.getByLabel('Text output').locator('.monaco-editor');
  await expect(output).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await selectTheme(page, 'monokai');
  await expect(output).toHaveCSS('background-color', 'rgb(39, 40, 34)');
});

test('malformed persisted settings does not prevent startup', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('settings', '{bad json'));
  await app(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'default');
});

test('unexpected persisted settings shape does not prevent startup', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('settings', '[]'));
  await app(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'default');
});

test('migrates cookie-only settings into local storage without losing editor preferences', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = `settings=${encodeURIComponent(JSON.stringify({ version: 4, theme: 'white', editor: { fontSize: 20 } }))}; path=/`;
  });
  await app(page);
  const state = await page.evaluate(() => {
    const stored = localStorage.getItem('settings');
    const app = (document.querySelector('#__nuxt') as HTMLElement & { __vue_app__?: { config: { globalProperties: { $pinia: { _s: Map<string, { editor: { fontSize: number } }> } } } } }).__vue_app__;
    return { stored: stored ? JSON.parse(stored) : null, fontSize: app?.config.globalProperties.$pinia._s.get('settings')?.editor.fontSize };
  });
  expect(state.stored).toMatchObject({ theme: 'white', editor: { fontSize: 20 } });
  expect(state.fontSize).toBe(20);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
});

test('malformed legacy cookie falls back without crashing', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'settings=%7Bbroken; path=/';
  });
  await app(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'default');
});
