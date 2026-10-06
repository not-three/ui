import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { pngBytes, raster, solidBitmap } from '../../lib/image/testing';
import { MODEL_BYTES } from '../../lib/image/background-model';
import { APP_ORIGIN } from './helpers';

const input = async (width = 100, height = 80) => Buffer.from(await pngBytes(solidBitmap(width, height, [255, 0, 0, 255])));

test('crop keeps all six aspect choices in the segmented control and edits natural pixels', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/crop`);
  const panel = page.getByRole('region', { name: 'Crop tool' });
  const aspect = panel.getByRole('radiogroup', { name: 'Aspect' });
  await expect(aspect.getByRole('radio')).toHaveCount(6);
  for (const name of ['Free', '1:1', '4:3', '16:9', '3:2', 'Custom']) await expect(aspect.getByRole('radio', { name })).toBeVisible();
  await aspect.getByRole('radio', { name: 'Custom' }).click();
  await panel.getByLabel('Custom ratio').fill('2:1');
  await panel.getByLabel('Image file').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: await input() });
  await expect(panel.getByLabel('Crop width')).toHaveValue('100');
  await panel.getByLabel('Crop width').fill('40');
  await expect(panel.getByLabel('Crop height')).toHaveValue('20');
  await panel.getByRole('button', { name: 'Run' }).click();
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('40 × 20 px');
});

test('opaque outline offers a direct background handoff with the current image', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/outline`);
  const panel = page.getByRole('region', { name: 'Sticker outline tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'opaque.png', mimeType: 'image/png', buffer: await input(4, 2) });
  await expect(panel.getByRole('region', { name: 'Hint' })).toContainText('Remove background first');
  await panel.getByRole('link', { name: 'Remove background first' }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/t/remove-background`);
  const background = page.getByRole('region', { name: 'Remove background tool' });
  await expect(background).toContainText('opaque-outline.png');
  await expect(background.getByRole('region', { name: 'Tool output' })).not.toBeVisible();
});

test('max-size compression preserves the first encoded download and changes size when quality changes', async ({ page }) => {
  test.setTimeout(120_000);
  const bitmap = solidBitmap(512, 512, [0, 0, 0, 255]);
  const pixels = raster(bitmap).data;
  let seed = 1;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    pixels[offset] = seed & 255; pixels[offset + 1] = (seed >>> 8) & 255; pixels[offset + 2] = (seed >>> 16) & 255;
  }
  await page.goto(`${APP_ORIGIN}/t/compress`);
  const panel = page.getByRole('region', { name: 'Compress tool' });
  await panel.getByRole('radiogroup', { name: 'Target' }).getByRole('radio', { name: 'Max size' }).click();
  await panel.getByLabel('Max size').fill('100');
  await panel.getByLabel('Image file').setInputFiles({ name: 'noise.png', mimeType: 'image/png', buffer: Buffer.from(await pngBytes(bitmap)) });
  const output = panel.getByRole('region', { name: 'Compressed image' });
  await expect(output.getByRole('button', { name: 'Download' })).toBeEnabled();
  const actualQuality = Number(await output.getByLabel('Quality').inputValue());
  expect(actualQuality).toBeGreaterThan(0);
  expect(actualQuality).toBeLessThan(82);
  const firstDownload = page.waitForEvent('download');
  await output.getByRole('button', { name: 'Download' }).click();
  const first = await firstDownload;
  const firstBytes = await readFile(await first.path());
  expect(firstBytes.length).toBeLessThanOrEqual(100 * 1024);
  await output.getByLabel('Quality').fill('95');
  await expect(output.getByRole('button', { name: 'Download' })).toBeEnabled();
  const secondDownload = page.waitForEvent('download');
  await output.getByRole('button', { name: 'Download' }).click();
  const second = await secondDownload;
  const secondBytes = await readFile(await second.path());
  expect(secondBytes.length).toBeGreaterThan(firstBytes.length);
  await expect(output.getByLabel('Quality')).toHaveValue('95');
});

test('favicon fixed outputs download with their declared names and MIME types', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/favicon`);
  await page.evaluate(() => {
    const state = window as Window & { __downloadMime?: string };
    const original = URL.createObjectURL.bind(URL);
    URL.createObjectURL = blob => { state.__downloadMime = blob.type; return original(blob); };
  });
  const panel = page.getByRole('region', { name: 'Favicon set tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: await input(8, 8) });
  for (const [label, name, mime, header] of [
    ['favicon.ico', 'favicon.ico', 'image/x-icon', [0, 0, 1, 0]],
    ['16 × 16 PNG', 'icon-16.png', 'image/png', [137, 80, 78, 71]],
  ] as const) {
    const download = page.waitForEvent('download');
    await panel.getByRole('region', { name: label }).getByRole('button', { name: 'Download' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(name);
    expect(await page.evaluate(() => (window as Window & { __downloadMime?: string }).__downloadMime)).toBe(mime);
    expect([...await readFile(await file.path())].slice(0, 4)).toEqual([...header]);
  }
});

test('background model progress shows advancing bytes only after Run, then processing', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript((modelBytes: number) => {
    const state = window as Window & { __modelFetches?: number };
    state.__modelFetches = 0;
    const original = window.fetch.bind(window);
    window.fetch = (resource, init) => {
      if (!String(resource).includes('model_quantized.onnx')) return original(resource, init);
      state.__modelFetches = (state.__modelFetches ?? 0) + 1;
      return Promise.resolve(new Response(new ReadableStream<Uint8Array>({
        start(controller) {
          setTimeout(() => controller.enqueue(new Uint8Array(1_000_000)), 300);
          setTimeout(() => controller.enqueue(new Uint8Array(1_000_000)), 900);
          setTimeout(() => { controller.enqueue(new Uint8Array(modelBytes - 2_000_000)); controller.close(); }, 1_700);
        },
      }), { headers: { 'content-length': String(modelBytes) } }));
    };
  }, MODEL_BYTES);
  await page.goto(`${APP_ORIGIN}/t/remove-background`);
  const panel = page.getByRole('region', { name: 'Remove background tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'subject.png', mimeType: 'image/png', buffer: await input(4, 2) });
  expect(await page.evaluate(() => (window as Window & { __modelFetches?: number }).__modelFetches)).toBe(0);
  await panel.getByRole('button', { name: 'Run' }).click();
  await expect(panel.getByRole('status')).toContainText('0% · 0.0 / 45.9 MB');
  await expect(panel.getByRole('status')).toContainText('2% · 1.0 / 45.9 MB');
  await expect(panel.getByRole('status')).toContainText('4% · 2.0 / 45.9 MB');
  await expect(panel.getByRole('status')).toHaveText('Processing…', { timeout: 30_000 });
  expect(await page.evaluate(() => (window as Window & { __modelFetches?: number }).__modelFetches)).toBe(1);
});
