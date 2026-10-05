import { expect, test, type Page } from '@playwright/test';
import { withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };

async function openEditor(page: Page) {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto('http://127.0.0.1:8789/');
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
}

async function openToolMenu(page: Page, category: string, tool: string) {
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: `${category} ▸` }).click();
  await page.getByRole('button', { name: tool, exact: true }).click();
}

test('catalogue opens from Tools menu and Ctrl+Alt+T', async ({ page }) => {
  await openEditor(page);
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Tools…' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:8789/t');
  await expect(page.getByRole('link', { name: /Base64/ })).toBeVisible();
  await openEditor(page);
  await page.locator('#logo').click();
  await page.keyboard.press('Control+Alt+t');
  await expect(page).toHaveURL('http://127.0.0.1:8789/t');
});

test('Base64 selection encodes and decodes locally', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('hello');
  await page.keyboard.press('Control+a');
  await openToolMenu(page, 'Encode', 'Base64');
  const panel = page.getByRole('region', { name: 'Base64 tool' });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('aGVsbG8=');
  await panel.getByRole('button', { name: 'Replace selection' }).click();
  await panel.getByLabel('Input source').selectOption('note');
  await panel.getByLabel('Mode').selectOption('decode');
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('5 bytes');
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toBe('decoded.bin');
  network.assertNoNetwork();
});

test('hashes a real file on the standalone route without an API request', async ({ page }) => {
  await page.goto('http://127.0.0.1:8789/t/hash');
  const panel = page.getByRole('region', { name: 'Hash tool' });
  await panel.getByLabel('Input source').selectOption('file');
  await panel.getByLabel('Input file').setInputFiles({ name: 'abc.txt', mimeType: 'text/plain', buffer: Buffer.from('abc') });
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('table')).toContainText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', { timeout: 30_000 });
  network.assertNoNetwork();
  expect(new URL(page.url()).searchParams.has('input')).toBe(false);
});

test('diff takes the right side into the note', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.insertText('a=1');
  await openToolMenu(page, 'Transform', 'Diff');
  const panel = page.getByRole('region', { name: 'Diff tool' });
  await panel.getByLabel('Right text').fill('a=2');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Take right' })).toBeVisible();
  await panel.getByRole('button', { name: 'Take right' }).click();
  await expect(page.locator('.monaco-editor').first()).toContainText('a=2');
  network.assertNoNetwork();
});

test('tool command is available in the Monaco command palette', async ({ page }) => {
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('F1');
  await page.keyboard.insertText('Hash');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Hash tool' })).toBeVisible();
});

test('catalogue and palette find a tool by keyword', async ({ page }) => {
  await page.goto('http://127.0.0.1:8789/t');
  await page.getByRole('searchbox', { name: 'Search tools' }).fill('b64');
  await expect(page.getByRole('link', { name: /Base64/ })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search tools' }).fill('bse64');
  await expect(page.getByRole('link', { name: /Base64/ })).toBeVisible();
  await openEditor(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('F1');
  await page.keyboard.insertText('b64');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Base64 tool' })).toBeVisible();
});

for (const sample of [
  { id: 'hex', input: 'Hi', expected: '4869', inputLabel: 'Input text' },
  { id: 'url', input: 'a b', expected: 'a%20b', inputLabel: 'Input text' },
  { id: 'json-lint', input: '{"a":1}', expected: 'Valid JSON', inputLabel: 'JSON text' },
]) {
  test(`${sample.id} runs locally from the standalone page`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:8789/t/${sample.id}`);
    const panel = page.getByRole('region', { name: new RegExp('tool$') });
    await panel.getByLabel(sample.inputLabel).fill(sample.input);
    const network = await withNoNetwork(page);
    await panel.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText(sample.expected, { timeout: 30_000 });
    network.assertNoNetwork();
  });
}

test('route options preset without taking input from query data', async ({ page }) => {
  await page.goto('http://127.0.0.1:8789/t/hash?algorithm=md5&input=private');
  const panel = page.getByRole('region', { name: 'Hash tool' });
  await expect(panel.getByLabel('Algorithm')).toHaveValue('md5');
  await expect(panel.getByLabel('Input text')).toHaveValue('');
});

test('unknown tool route returns to catalogue', async ({ page }) => {
  await page.goto('http://127.0.0.1:8789/t/missing');
  await expect(page).toHaveURL('http://127.0.0.1:8789/t');
});

test('standalone text output opens in an editor note', async ({ page }) => {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto('http://127.0.0.1:8789/t/url');
  const panel = page.getByRole('region', { name: 'URL encode/decode tool' });
  await panel.getByLabel('Input text').fill('a b');
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Open in editor' })).toBeVisible();
  network.assertNoNetwork();
  await panel.getByRole('button', { name: 'Open in editor' }).click();
  await expect(page.locator('.monaco-editor').first()).toContainText('a%20b');
});
