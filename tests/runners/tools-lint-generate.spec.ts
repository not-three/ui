import { expect, test } from '@playwright/test';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };

test('YAML lint checks pasted text on the standalone route without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/yaml-lint`);
  const panel = page.getByRole('region', { name: 'YAML lint tool' });
  await panel.getByLabel('Input text').fill('items: [a, b');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('error:', { timeout: 30_000 });
  network.assertNoNetwork();
});

test('Markdown lint reports a note heading through the editor panel without network', async ({ page }) => {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('# Title\n\n### Deep');
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Lint ▸' }).click();
  await page.getByRole('button', { name: 'Markdown lint', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Markdown lint tool' });
  // Nuxt Icon renders CSS-mode spans and injects a style after each icon loads.
  // Finish those navigation requests before measuring the tool run itself.
  await expect(page.locator('style[data-nuxt-icon-dev="lucide:play"]')).toHaveCount(1);
  await expect(page.locator('style[data-nuxt-icon-dev="lucide:align-left"]')).toHaveCount(1);
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('Heading level jumps', { timeout: 30_000 });
  network.assertNoNetwork();
});

test('QR tool downloads PNG from pasted text without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/qr`);
  const panel = page.getByRole('region', { name: 'QR code tool' });
  await panel.getByLabel('Input text').fill('hello');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('bytes', { timeout: 30_000 });
  network.assertNoNetwork();
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toBe('qr.png');
});

test('CSS lint reads a local file without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/css-lint`);
  const panel = page.getByRole('region', { name: 'CSS lint tool' });
  await panel.getByLabel('Input source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Input file').setInputFiles({ name: 'site.css', mimeType: 'text/css', buffer: Buffer.from('body { color: red; }') });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('Valid CSS syntax', { timeout: 30_000 });
  network.assertNoNetwork();
});

test('SQL lint checks SQLite syntax on the standalone route without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/sql-lint`);
  const panel = page.getByRole('region', { name: 'SQL lint tool' });
  await panel.getByLabel('Input text').fill('SELECT FROM;');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('error:', { timeout: 30_000 });
  network.assertNoNetwork();
});

test('SQL lint parses PostgreSQL DDL without network', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/sql-lint`);
  const panel = page.getByRole('region', { name: 'SQL lint tool' });
  await panel.getByLabel('Dialect').getByRole('radio', { name: 'PostgreSQL' }).click();
  await panel.getByLabel('Input text').fill('CREATE TABLE items (id integer PRIMARY KEY);');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('Valid PostgreSQL syntax', { timeout: 60_000 });
  network.assertNoNetwork();
});
