import { expect, test, type Page } from '@playwright/test';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };

async function openEditor(page: Page) {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
}

async function openTransform(page: Page, title: string) {
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Transform ▸' }).click();
  await page.getByRole('button', { name: title, exact: true }).click();
}

test('converts a pasted JSON value on the standalone page locally', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/json-yaml`);
  const panel = page.getByRole('region', { name: 'JSON ↔ YAML tool' });
  await panel.getByLabel('Input text').fill('{"name":"Zoë","items":[1,2]}');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('Zoë');
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('items:');
  network.assertNoNetwork();
});

test('sorts selected lines in the editor locally', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('z\na\n');
  await page.keyboard.press('Control+a');
  await openTransform(page, 'Sort lines');
  const panel = page.getByRole('region', { name: 'Sort lines tool' });
  await expect(panel.getByLabel('Input source')).toHaveValue('selection');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('a');
  await panel.getByRole('button', { name: 'Replace selection' }).click();
  await expect.poll(async () => (await page.locator('.monaco-editor').first().locator('.view-line').allTextContents()).slice(0, 2)).toEqual(['a', 'z']);
  network.assertNoNetwork();
});

test('counts the current note without a request', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('hello world');
  await openTransform(page, 'Text statistics');
  const panel = page.getByRole('region', { name: 'Text statistics tool' });
  await expect(panel.getByLabel('Input source')).toHaveValue('note');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('table')).toContainText('Words');
  await expect(panel.getByRole('table')).toContainText('11');
  network.assertNoNetwork();
});

test('converts a local CSV file on the standalone page', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/csv-json`);
  const panel = page.getByRole('region', { name: 'CSV ↔ JSON tool' });
  await panel.getByLabel('Input source').selectOption('file');
  await panel.getByLabel('Input file').setInputFiles({ name: 'people.csv', mimeType: 'text/csv', buffer: Buffer.from('name,note\n"Zoë","hello, world"') });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('Zoë');
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('hello, world');
  network.assertNoNetwork();
});
