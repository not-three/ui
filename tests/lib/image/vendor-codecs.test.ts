import { expect, it, vi } from 'vitest';
import { bitmapFromHeicImage } from '../../../lib/image/vendor-codecs';

it('rejects oversized HEIC dimensions before requesting pixel display', async () => {
  for (const [width, height, expected] of [[10_000, 6_000, '50 MP'], [16_385, 1, '16384']] as const) {
    const display = vi.fn();
    const image = { get_width: () => width, get_height: () => height, display };
    await expect(bitmapFromHeicImage(image)).rejects.toThrow(expected);
    expect(display).not.toHaveBeenCalled();
  }
});
