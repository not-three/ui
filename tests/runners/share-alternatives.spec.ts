import { expect, test, type Page } from '@playwright/test';
import sdk from '@not3/sdk';
import type { CryptoMode } from '@not3/sdk';
import { APP_ORIGIN } from './helpers';

const { Crypto, FragmentData, ShareGenerator } = sdk;

const info = {
  version: '2.4.0', availableTokens: 100, maxStorageTimeDays: 30,
  fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
};

async function mockApi(page: Page) {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
}

async function openNote(page: Page, mode: CryptoMode, share: string) {
  await mockApi(page);
  const seed = Crypto.generateSeed();
  const fragment = new FragmentData({ seed, cryptoMode: mode });
  const key = await Crypto.generateKey(seed, mode);
  const content = await Crypto.encrypt('A shared note', key, mode);
  await page.route('**/api/note/note-1/json', route => route.fulfill({ json: {
    content, expiresAt: Math.floor(Date.now() / 1000) + 3600, mime: 'text/plain', deleted: false,
  } }));
  const link = `${APP_ORIGIN}/q/note-1?share=${share}#${fragment.toString()}`;
  await page.goto(link);
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30_000 });
  return { fragment, link: `${APP_ORIGIN}/q/note-1#${fragment.toString()}` };
}

test('a CBC note offers six rows and copies the exact SDK value from a legacy deep link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { fragment, link } = await openNote(page, 'cbc', 'curl');
  const dialog = page.locator('.dialog-content');
  await expect(dialog.getByRole('heading', { name: 'Share' })).toBeVisible({ timeout: 30_000 });
  await expect(dialog.locator('[data-share-alternative]')).toHaveCount(6);
  const rows = new ShareGenerator({ apiUrl: `${APP_ORIGIN}/api/`, uiUrl: `${APP_ORIGIN}/` }).alternatives({
    kind: 'note', id: 'note-1', seed: fragment.seed, cryptoMode: 'cbc', fragment,
  });
  await expect(dialog.locator('[data-share-alternative]').first().locator('code')).toHaveText(link);
  await dialog.getByRole('button', { name: 'Copy CLI' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(rows[1].value);
  if (process.env.NOT3_SHARE_SCREENSHOT) {
    await expect(page.locator('.overlay-container.z-40')).toHaveCount(0, { timeout: 30_000 });
    await page.setViewportSize({ width: 900, height: 1300 });
    await dialog.screenshot({ path: process.env.NOT3_SHARE_SCREENSHOT });
  }
});

test('sharing an editable note saves a link with share=alternatives', async ({ page }) => {
  await mockApi(page);
  await page.route('**/api/note/json', route => route.fulfill({ json: { id: 'saved' } }));
  await page.goto(`${APP_ORIGIN}/`);
  await page.locator('.monaco-editor').click();
  await page.keyboard.insertText('A note to share');
  await page.getByRole('heading', { name: 'Share', exact: true }).click();
  const create = page.waitForRequest(request => request.url().endsWith('/api/note/json') && request.method() === 'POST');
  await page.getByRole('button', { name: 'Share alternatives' }).click();
  expect((await create).postDataJSON().content).toBeTruthy();
  await expect(page).toHaveURL(/\/q\/saved\?share=alternatives#/);
});

test('a GCM note opens three rows from the new deep link at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const { link } = await openNote(page, 'gcm', 'alternatives');
  const dialog = page.locator('.dialog-content');
  await expect(dialog.locator('[data-share-alternative]')).toHaveCount(3, { timeout: 30_000 });
  await expect(dialog.locator('[data-share-alternative] h2')).toHaveText(['Link', 'CLI', 'Docker']);
  await expect(dialog.locator('code').first()).toHaveText(link);
  await expect(dialog).toBeInViewport();
  expect(await dialog.evaluate(node => node.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('a file download page opens the file alternatives', async ({ page }) => {
  await mockApi(page);
  const seed = Crypto.generateSeed();
  const fragment = new FragmentData({ seed });
  await page.route('**/api/file/file-1?json=true', route => route.fulfill({ json: {
    url: `${APP_ORIGIN}/api/file/file-1/chunk`, size: 120, name: 'my file.txt',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  } }));
  await page.goto(`${APP_ORIGIN}/f/file-1#${fragment.toString()}`);
  await page.getByRole('button', { name: 'Share alternatives' }).click();
  const dialog = page.locator('.dialog-content');
  await expect(dialog.locator('[data-share-alternative]')).toHaveCount(5);
  await expect(dialog.locator('[data-share-alternative] h2')).toHaveText(['Link', 'CLI', 'Docker', 'cURL', 'PowerShell']);
  await expect(dialog.locator('code').first()).toHaveText(`${APP_ORIGIN}/f/file-1#${fragment.toString()}`);
  await expect(dialog.locator('code').nth(1)).toContainText("'my file.txt'");
});

test('a P2P send offers only Link, CLI and Docker after the link exists', async ({ page }) => {
  await mockApi(page);
  await page.routeWebSocket('**/api/p2p', ws => {
    ws.onMessage(message => {
      if (JSON.parse(String(message)).type === 'create') ws.send(JSON.stringify({ type: 'created', sessionId: 'session-1', iceServers: [] }));
    });
  });
  await page.goto(`${APP_ORIGIN}/`);
  await page.getByRole('heading', { name: 'Tools' }).click();
  await page.getByRole('button', { name: 'P2P Transfer' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file' }).click();
  await (await chooser).setFiles({ name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Share alternatives' }).click();
  const dialog = page.locator('.dialog-content');
  await expect(dialog.locator('[data-share-alternative] h2')).toHaveText(['Link', 'CLI', 'Docker']);
  const link = await page.locator('p.break-all.select-all').textContent();
  await expect(dialog.locator('code').first()).toHaveText(link!);
});
