import { expect, test } from '@playwright/test';
import { APP_ORIGIN } from './helpers';

test('dialog inputs and file transfer panels use one pixel borders', async ({ page }) => {
  await page.route('**/api/info', route => route.fulfill({ json: {
    version: '2.4.0', availableTokens: 100, maxStorageTimeDays: 30,
    fileTransferEnabled: true, fileTransferMaxSize: 100, privateMode: false, p2pEnabled: true,
  } }));
  await page.goto(`${APP_ORIGIN}/`);
  await page.getByRole('heading', { name: 'File' }).click();
  await page.getByRole('button', { name: 'Save for custom time' }).click();
  await expect(page.locator('.dialog-content input')).toHaveCSS('border-top-width', '1px');
  await page.locator('.dialog-content').getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('heading', { name: 'Tools' }).click();
  await page.getByRole('button', { name: 'File Transfer' }).click();
  const transfer = page.getByRole('button', { name: 'Select File' }).locator('xpath=../..');
  await expect(transfer).toHaveCSS('border-top-width', '1px');
  await expect(transfer.getByRole('button', { name: 'Select File' })).toHaveCSS('border-top-width', '1px');
});
