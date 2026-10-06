import { expect, test } from '@playwright/test';
import { TOOLS } from '../../lib/tools/registry';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };
const categories = [...new Set(TOOLS.map(tool => tool.category))];

test('catalogue groups all tools and searches descriptions, keywords, and categories', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t`);
  const network = await withNoNetwork(page);
  await expect(page.getByRole('searchbox', { name: 'Search tools' })).toBeFocused();
  for (const category of categories) {
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: category, exact: true }) });
    const tools = TOOLS.filter(tool => tool.category === category);
    await expect(section.getByRole('link')).toHaveCount(tools.length);
    for (const tool of tools) {
      const link = section.getByRole('link', { name: new RegExp('^' + tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
      await expect(link).toContainText(tool.description);
      await expect(link).toHaveAttribute('href', `/t/${tool.id}`);
    }
  }
  for (const [query, id] of [['checksum', 'hash'], ['placeholder', 'lorem'], ['syntax', 'json-lint'], ['bse64', 'base64'], ['crypto', 'aes']]) {
    await page.getByRole('searchbox', { name: 'Search tools' }).fill(query);
    await expect(page.getByRole('link', { name: new RegExp('^' + TOOLS.find(tool => tool.id === id)!.title, 'i') })).toBeVisible();
  }
  network.assertNoNetwork();
});

for (const category of categories) {
  const tools = TOOLS.filter(tool => tool.category === category);
  test(`all ${category} tools open through the menu`, async ({ page }) => {
    await page.route('**/api/info', route => route.fulfill({ json: info }));
    await page.goto(`${APP_ORIGIN}/`);
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
    for (const tool of tools) {
      await page.getByRole('heading', { name: 'Tools', exact: true }).click();
      const submenu = page.getByRole('button', { name: `${category[0].toUpperCase()}${category.slice(1)} ▸` });
      if (await submenu.getAttribute('aria-expanded') === 'false') await submenu.click();
      await page.getByRole('button', { name: tool.title, exact: true }).click();
      await expect(page.getByRole('region', { name: `${tool.title} tool` })).toBeVisible();
      await page.getByRole('button', { name: 'Close tools panel' }).click();
    }
  });

  test(`all ${category} tools load on their own routes`, async ({ page }) => {
    for (const tool of tools) {
      await page.goto(`${APP_ORIGIN}/t/${tool.id}`);
      await expect(page.getByRole('region', { name: `${tool.title} tool` })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('heading', { name: tool.title, exact: true })).toBeVisible();
    }
  });
}

test('phone width stacks the editor above the tool panel', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Encode ▸' }).click();
  await page.getByRole('button', { name: 'Base64', exact: true }).click();
  const editor = await page.locator('.monaco-editor').first().boundingBox();
  const panel = await page.getByRole('complementary', { name: 'Tools panel' }).boundingBox();
  expect(editor).not.toBeNull();
  expect(panel).not.toBeNull();
  expect(panel!.y).toBeGreaterThanOrEqual(editor!.y + editor!.height - 1);
  expect(panel!.width).toBeLessThanOrEqual(375);
  const network = await withNoNetwork(page);
  await page.getByRole('region', { name: 'Base64 tool' }).getByLabel('Input source').getByRole('radio', { name: 'Text' }).click();
  await page.getByRole('region', { name: 'Base64 tool' }).getByLabel('Input text').fill('hello');
  await page.getByRole('region', { name: 'Base64 tool' }).getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Tool output' })).toContainText('aGVsbG8=');
  network.assertNoNetwork();
});

test('standalone output actions follow whether bytes contain editable text', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/hex`);
  const panel = page.getByRole('region', { name: 'Hex tool' });
  await panel.getByLabel('Input text').fill('ff');
  await panel.getByLabel('Mode').getByRole('radio', { name: 'Decode' }).click();
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('1 bytes');
  await expect(panel.getByRole('button', { name: 'Download' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Copy' })).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Open in editor' })).toHaveCount(0);
  await panel.getByLabel('Mode').getByRole('radio', { name: 'Encode' }).click();
  await panel.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Copy' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Open in editor' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Replace note' })).toHaveCount(0);
  network.assertNoNetwork();
});
