import { expect, test } from '@playwright/test';
import { pngBytes, solidBitmap } from '../../lib/image/testing';
import { APP_ORIGIN, withNoNetwork } from './helpers';

test('removes background on demand using one same-origin model fetch', async ({ page }) => {
  test.setTimeout(180_000);
  const modelRequests: string[] = [];
  const diagnostics: string[] = [];
  page.on('console', message => { if (message.type() === 'error') diagnostics.push(message.text()); });
  page.on('requestfailed', request => diagnostics.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('request', request => { if (request.url().includes('model_quantized.onnx')) modelRequests.push(request.url()); });
  await page.goto(`${APP_ORIGIN}/t/remove-background`);
  const panel = page.getByRole('region', { name: 'Remove background tool' });
  await expect(panel).toContainText('Downloads a 40–90 MB model once per session');
  const image = Buffer.from(await pngBytes(solidBitmap(4, 2, [255, 0, 0, 255])));
  await panel.getByLabel('Image file').setInputFiles({ name: 'subject.png', mimeType: 'image/png', buffer: image });
  await expect(panel.getByRole('button', { name: 'Run' })).toBeEnabled();
  expect(modelRequests).toEqual([]);
  const network = await withNoNetwork(page);
  await panel.getByRole('button', { name: 'Run' }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' }).or(panel.getByRole('alert'))).toBeVisible({ timeout: 150_000 });
  expect(await panel.getByRole('alert').allTextContents(), diagnostics.join('\n')).toEqual([]);
  expect(modelRequests).toEqual([`${APP_ORIGIN}/vendor/image/isnet-general-use/model_quantized.onnx`]);
  await panel.getByLabel('Feather edge (px)').fill('0');
  await panel.getByRole('button', { name: 'Run' }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toBeVisible({ timeout: 150_000 });
  expect(modelRequests).toHaveLength(1);
  await panel.getByRole('radio', { name: 'PNG' }).click();
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('subject-remove-background.png');
  const bytes = await (await import('node:fs/promises')).readFile(await file.path());
  const alpha = await page.evaluate(async values => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(values)], { type: 'image/png' }));
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d')!; context.drawImage(bitmap, 0, 0);
    return [...context.getImageData(0, 0, bitmap.width, bitmap.height).data].filter((_, index) => index % 4 === 3);
  }, [...bytes]);
  expect(alpha.some(value => value < 255)).toBe(true);
  network.assertNoNetwork();
});

test('cancelled download leaves no stale output', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(`${APP_ORIGIN}/t/remove-background`);
  const panel = page.getByRole('region', { name: 'Remove background tool' });
  const image = Buffer.from(await pngBytes(solidBitmap(2, 2, [0, 0, 255, 255])));
  await panel.getByLabel('Image file').setInputFiles({ name: 'subject.png', mimeType: 'image/png', buffer: image });
  await page.route('**/vendor/image/isnet-general-use/model_quantized.onnx', route => new Promise(resolve => {
    setTimeout(() => { void route.continue().finally(resolve); }, 1000);
  }));
  await panel.getByRole('button', { name: 'Run' }).click();
  await expect(panel.getByRole('progressbar')).toBeVisible();
  await panel.getByLabel('Feather edge (px)').fill('4');
  await expect(panel.getByRole('progressbar')).not.toBeVisible();
  await page.waitForTimeout(1200);
  await expect(panel.getByRole('region', { name: 'Tool output' })).not.toBeVisible();
});
