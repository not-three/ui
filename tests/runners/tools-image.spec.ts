import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { inspectImage } from '../../lib/image/decode';
import { pngBytes, solidBitmap } from '../../lib/image/testing';
import { APP_ORIGIN, withNoNetwork } from './helpers';

const info = { version: '2.1.1', availableTokens: 100, maxStorageTimeDays: 30, fileTransferEnabled: false, privateMode: false, p2pEnabled: false };
const sample = async () => Buffer.from(await pngBytes(solidBitmap(4, 2, [255, 0, 0, 255])));

test('drop PNG, resize, export WebP and continue with another image tool', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/resize`);
  const panel = page.getByRole('region', { name: 'Resize tool' });
  await panel.getByLabel('Width').fill('2');
  const network = await withNoNetwork(page);
  const bytes = await sample();
  await panel.evaluate((element, array) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(array)], 'sample.png', { type: 'image/png' }));
    element.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
  }, [...bytes]);
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('2 × 1 px');
  await expect(panel.getByRole('radio', { name: 'WEBP' })).toBeChecked();
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download' }).click();
  const downloaded = await download;
  expect(downloaded.suggestedFilename()).toBe('sample-resize.webp');
  const exported = inspectImage(new Uint8Array(await readFile(await downloaded.path())));
  expect(exported).toMatchObject({ format: 'webp', width: 2, height: 1 });
  expect(await page.evaluate(() => Object.entries(localStorage).map(([, value]) => value).join(' '))).not.toContain('sample.png');
  await panel.getByRole('button', { name: 'Continue with…' }).click();
  await panel.getByRole('button', { name: 'Rotate and flip' }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/t/rotate`);
  await expect(page.getByRole('region', { name: 'Rotate and flip tool' }).getByRole('region', { name: 'Tool output' })).toBeVisible();
  network.assertNoNetwork();
});

test('continues from resize to crop and keeps numeric and dragged coordinates in pixels', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/resize`);
  const panel = page.getByRole('region', { name: 'Resize tool' });
  await panel.getByLabel('Width').fill('80');
  await panel.getByLabel('Image file').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(await pngBytes(solidBitmap(100, 80, [255, 0, 0, 255]))) });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('80 × 64 px');
  await panel.getByRole('button', { name: 'Continue with…' }).click();
  await panel.getByRole('button', { name: 'Crop', exact: true }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/t/crop`);
  const crop = page.getByRole('region', { name: 'Crop tool' });
  await expect(crop.getByRole('region', { name: 'Tool output' })).toContainText('80 × 64 px');
  await crop.getByLabel('Crop x').fill('10');
  await crop.getByLabel('Crop y').fill('8');
  await crop.getByLabel('Crop width').fill('20');
  await crop.getByLabel('Crop height').fill('16');
  await crop.getByRole('button', { name: 'Run' }).click();
  await expect(crop.getByRole('region', { name: 'Tool output' })).toContainText('20 × 16 px');
  const stage = crop.locator('[data-stage] [tabindex="0"]').first();
  const bounds = await stage.boundingBox();
  expect(bounds).toBeTruthy();
  await crop.locator('[data-handle="se"]').first().dispatchEvent('pointerdown', { pointerId: 1, clientX: bounds!.x + 30, clientY: bounds!.y + 24 });
  await stage.dispatchEvent('pointermove', { pointerId: 1, clientX: bounds!.x + 35, clientY: bounds!.y + 29 });
  await stage.dispatchEvent('pointerup', { pointerId: 1 });
  await expect(crop.getByLabel('Crop width')).toHaveValue('25');
  await expect(crop.getByLabel('Crop height')).toHaveValue('21');
});

test('pasted image converts in the editor panel without persisting image bytes or copying implicitly', async ({ page }) => {
  await page.route('**/api/info', route => route.fulfill({ json: info }));
  await page.goto(`${APP_ORIGIN}/`);
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => {
    const tracked = window as Window & { __imageCopies?: number };
    tracked.__imageCopies = 0;
    if (navigator.clipboard) Object.defineProperty(navigator.clipboard, 'write', { configurable: true, value: async () => { tracked.__imageCopies = (tracked.__imageCopies ?? 0) + 1; } });
  });
  await page.getByRole('heading', { name: 'Tools', exact: true }).click();
  await page.getByRole('button', { name: 'Image ▸' }).click();
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Convert tool' });
  await expect(panel.getByLabel('Image source')).toHaveCount(0);
  const bytes = await sample();
  await page.locator('.monaco-editor').first().click();
  await page.evaluate(array => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(array)], 'pasted.png', { type: 'image/png' }));
    document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
  }, [...bytes]);
  await expect(panel.getByRole('region', { name: 'Tool output' })).toBeVisible();
  await expect(page.locator('.monaco-editor').first()).not.toContainText('pasted.png');
  expect(await page.evaluate(() => Object.entries(localStorage).filter(([key]) => /settings|history/i.test(key)).map(([, value]) => value).join(' '))).not.toContain('pasted.png');
  expect(page.url()).not.toContain('pasted');
  expect(await page.evaluate(() => (window as Window & { __imageCopies?: number }).__imageCopies)).toBe(0);
  await panel.getByRole('button', { name: 'Copy image' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __imageCopies?: number }).__imageCopies)).toBe(1);
});

test('rejects a 60 MP JPEG from its header before decoding', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const jpeg = Buffer.from([255,216,255,192,0,17,8,0x4e,0x20,0x2e,0xe0,3,1,17,0,2,17,0,3,17,0,255,217]);
  const panel = page.getByRole('region', { name: 'Convert tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'too-large.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  await expect(panel.getByRole('alert')).toContainText('50 MP');
  await expect(panel.getByRole('button', { name: 'Run' })).toBeEnabled();
});

test('rasterises an SVG file without dimensions at 1024 px wide', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const panel = page.getByRole('region', { name: 'Convert tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'shape.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 1"><rect width="2" height="1" fill="red"/></svg>') });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('1024 × 512 px');
});

test('applies JPEG EXIF orientation before the tool sees pixels', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/convert`);
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 2; canvas.height = 1;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'red'; context.fillRect(0, 0, 1, 1);
    context.fillStyle = 'green'; context.fillRect(1, 0, 1, 1);
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(value => resolve(value!), 'image/jpeg')!);
    const jpeg = new Uint8Array(await blob.arrayBuffer());
    const exif = Uint8Array.from([255,225,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0]);
    return [...jpeg.subarray(0, 2), ...exif, ...jpeg.subarray(2)];
  });
  const panel = page.getByRole('region', { name: 'Convert tool' });
  await panel.getByLabel('Image file').setInputFiles({ name: 'oriented.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(bytes) });
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('1 × 2 px');
});

test('image inputs take files only, accept a clipboard image pasted anywhere, and zoom the stage', async ({ page }) => {
  await page.goto(`${APP_ORIGIN}/t/region-blur`);
  const panel = page.getByRole('region', { name: 'Blur region tool' });
  await expect(panel.getByLabel('Image source')).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Choose image' })).toBeVisible();
  await expect(panel).toContainText('press Ctrl+V');
  const network = await withNoNetwork(page);
  const bytes = Buffer.from(await pngBytes(solidBitmap(40, 20, [0, 128, 255, 255])));
  await page.evaluate(array => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(array)], 'clip.png', { type: 'image/png' }));
    const event = new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true });
    document.body.dispatchEvent(event);
  }, [...bytes]);
  await expect(panel).toContainText('clip.png');
  await expect(panel.getByRole('region', { name: 'Tool output' })).toContainText('40 × 20 px');
  const stage = panel.locator('[data-frame]').first();
  const fitWidth = (await stage.boundingBox())!.width;
  await panel.getByLabel('Zoom').first().getByRole('radio', { name: '400 %' }).click();
  const zoomed = (await stage.boundingBox())!.width;
  expect(zoomed).toBeGreaterThan(fitWidth);
  expect(Math.round(zoomed)).toBe(160);
  await stage.click({ position: { x: 20, y: 20 } });
  await expect(panel.getByLabel('Region x')).toHaveValue('5');
  await expect(panel.getByLabel('Region y')).toHaveValue('5');
  network.assertNoNetwork();
});
