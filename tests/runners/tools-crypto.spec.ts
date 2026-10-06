import { expect, test, type Page } from '@playwright/test';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };
async function openEditor(page: Page) {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
}

test('ROT13 works on a selected editor range without network', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('hello');
  await page.keyboard.press('Control+a');
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Crypto ▸' }).click();
  await page.getByRole('button', { name: 'ROT13', exact: true }).click();
  const panel = page.getByRole('region', { name: 'ROT13 tool' });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('uryyb');
  await panel.getByRole('button', { name: 'Replace selection' }).click();
  await expect(page.locator('.monaco-editor').first()).toContainText('uryyb');
  network.assertNoNetwork();
});

test('HMAC streams a file on its standalone page without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/hmac`);
  const panel = page.getByRole('region', { name: 'HMAC tool' });
  await panel.getByLabel('Input source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Input file').setInputFiles({ name: 'abc.txt', mimeType: 'text/plain', buffer: Buffer.from('abc') });
  await panel.getByLabel('Secret key text').fill('key');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect.poll(async () => await panel.getByRole('table').count() || await panel.getByRole('alert').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  if (await panel.getByRole('alert').count()) throw new Error(await panel.getByRole('alert').innerText());
  await expect(panel.getByRole('table')).toContainText('9c196e32dc0175f86f4b1cb89289d6619de6bee699e4c378e68309ed97a1a6ab');
  network.assertNoNetwork();
});

test('AES encrypts a file and downloads binary ciphertext locally', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/aes`);
  const panel = page.getByRole('region', { name: 'AES tool' });
  await panel.getByLabel('Input source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Input file').setInputFiles({ name: 'secret.bin', mimeType: 'application/octet-stream', buffer: Buffer.from([0, 255, 1]) });
  await panel.getByLabel('Password or hex key text').fill('browser secret');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('bytes', { timeout: 30_000 });
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toBe('encrypted.aes');
  network.assertNoNetwork();
});

test('password output can be downloaded without persisting its value', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/password`);
  const panel = page.getByRole('region', { name: 'Password tool' });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  const secret = await panel.getByRole('region', { name: 'Secret' }).locator('.monaco-editor').textContent();
  expect(secret?.length).toBeGreaterThan(0);
  const download = page.waitForEvent('download');
  await panel.getByRole('region', { name: 'Secret' }).getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toBe('secret.txt');
  expect(page.url()).not.toContain(secret!);
  const persisted = await page.evaluate(() => JSON.stringify({ storage: Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])), history: history.state }));
  expect(persisted).not.toContain(secret!);
  network.assertNoNetwork();
});
