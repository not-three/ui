import { afterEach, expect, it, vi } from 'vitest';
import { decodeImage } from '~/lib/image/decode';

afterEach(() => vi.unstubAllGlobals());

const jpegWithFillBeforeSof = Uint8Array.from([
  0xff, 0xd8, 0xff, 0xff, 0xc0, 0x00, 0x11, 0x08,
  0x4e, 0x20, 0x2e, 0xe0, 0x03,
  0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
  0xff, 0xd9,
]);

it('rejects a fill-byte JPEG over 50 MP before calling the browser decoder', async () => {
  const decoder = vi.fn();
  vi.stubGlobal('createImageBitmap', decoder);

  await expect(decodeImage(jpegWithFillBeforeSof)).rejects.toThrow('50 MP limit');
  expect(decoder).not.toHaveBeenCalled();
});

it('rejects a raster with uninspectable dimensions before calling the browser decoder', async () => {
  const decoder = vi.fn();
  vi.stubGlobal('createImageBitmap', decoder);

  await expect(decodeImage(Uint8Array.from([0x89, 80, 78, 71, 13, 10, 26, 10]))).rejects.toThrow('dimensions');
  expect(decoder).not.toHaveBeenCalled();
});

it('retains a post-decode size error and closes an oversized bitmap', async () => {
  const close = vi.fn();
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 12000, height: 20000, close }));
  const smallJpeg = jpegWithFillBeforeSof.slice();
  smallJpeg[8] = 0;
  smallJpeg[9] = 1;
  smallJpeg[10] = 0;
  smallJpeg[11] = 1;

  await expect(decodeImage(smallJpeg)).rejects.toThrow('50 MP limit');
  expect(close).toHaveBeenCalledOnce();
});
