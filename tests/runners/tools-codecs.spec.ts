import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectImage } from '../../lib/image/decode';
import { pngBytes, solidBitmap } from '../../lib/image/testing';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const fixture = join(import.meta.dirname, '..', 'fixtures', 'image', 'colors-no-alpha.heic');

test('AVIF and JXL exports round trip through vendored codecs on the app origin', async ({ page }) => {
  const imageRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/vendor/image/')) imageRequests.push(request.url());
  });
  await page.goto(`${APP_ORIGIN}/t/convert`);
  expect(imageRequests).toEqual([]);
  const network = await withNoNetwork(page);
  const panel = page.getByRole('region', { name: 'Convert tool' });
  const png = Buffer.from(await pngBytes(solidBitmap(3, 2, [255, 0, 0, 255])));
  await panel.getByLabel('Image source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Image file').setInputFiles({ name: 'red.png', mimeType: 'image/png', buffer: png });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toBeVisible();

  for (const format of ['AVIF', 'JXL'] as const) {
    await panel.getByRole('radio', { name: format }).click();
    await expect(panel.getByRole('button', { name: 'Download' })).toBeEnabled({ timeout: 30_000 });
    const download = page.waitForEvent('download');
    await panel.getByRole('button', { name: 'Download' }).click();
    const exported = new Uint8Array(await readFile(await (await download).path()));
    expect(inspectImage(exported).format).toBe(format.toLowerCase());
    if (format === 'JXL') expect(inspectImage(exported)).toMatchObject({ width: 3, height: 2 });
    await panel.getByLabel('Image file').setInputFiles({ name: `roundtrip.${format.toLowerCase()}`, mimeType: `image/${format.toLowerCase()}`, buffer: Buffer.from(exported) });
    await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('3 × 2 px');
  }
  expect(imageRequests.length).toBeGreaterThan(0);
  expect(imageRequests.every(url => new URL(url).origin === APP_ORIGIN)).toBe(true);
  network.assertNoNetwork();
});

test('HEIC input decodes through the vendored libheif bundle', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const network = await withNoNetwork(page);
  const panel = page.getByRole('region', { name: 'Convert tool' });
  await panel.getByLabel('Image source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Image file').setInputFiles(fixture);
  await expect(panel.getByRole('region', { name: 'Tool output' })).toBeVisible({ timeout: 30_000 });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText(/\d+ × \d+ px/);
  network.assertNoNetwork();
});

test('PNG, JPEG and WebP wasm packages encode and decode pixels', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const network = await withNoNetwork(page);
  const result = await page.evaluate(async () => {
    const formats = ['png', 'jpeg', 'webp'];
    const seen: Array<{ format: string; width: number; height: number; size: number }> = [];
    for (const format of formats) {
      const url = `/vendor/image/${format}/codec.mjs`;
      const codec = await import(/* @vite-ignore */ url);
      const raw = { width: 2, height: 2, data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]) };
      const bytes = await codec.encode(raw, format === 'webp' ? { lossless: 1 } : { quality: 82 });
      const decoded = await codec.decode(bytes);
      seen.push({ format, width: decoded.width, height: decoded.height, size: bytes.byteLength });
    }
    return seen;
  });
  expect(result).toEqual(['png', 'jpeg', 'webp'].map(format => ({ format, width: 2, height: 2, size: expect.any(Number) })));
  expect(result.every(item => item.size > 0)).toBe(true);
  network.assertNoNetwork();
});

test('unavailable vendored encoder is hidden and decode failures name the format', async ({ page }) => {
  await page.route('**/vendor/image/jxl/**', route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' }));
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const panel = page.getByRole('region', { name: 'Convert tool' });
  const png = Buffer.from(await pngBytes(solidBitmap(2, 2, [0, 0, 0, 255])));
  await panel.getByLabel('Image source').getByRole('radio', { name: 'File' }).click();
  await panel.getByLabel('Image file').setInputFiles({ name: 'black.png', mimeType: 'image/png', buffer: png });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toBeVisible();
  await expect(panel.getByRole('radio', { name: 'JXL' })).toHaveCount(0);
  await panel.getByLabel('Image file').setInputFiles({ name: 'broken.jxl', mimeType: 'image/jxl', buffer: Buffer.from([255, 10, 0, 0]) });
  await expect(panel.getByRole('alert')).toContainText('Cannot decode jxl');
});
