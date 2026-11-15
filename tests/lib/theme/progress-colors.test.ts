import { beforeEach, expect, it } from 'vitest';
import { progressColors } from '~/lib/theme/progress-colors';

beforeEach(() => {
  const root = document.documentElement;
  root.style.setProperty('--not3-bg', '0 0 0');
  root.style.setProperty('--not3-fg', '255 255 255');
  root.style.setProperty('--not3-accent', '255 255 255');
});

it('derives the Default progress ramp from semantic channels', () => {
  expect(progressColors().read).toBe('rgb(51, 51, 51)');
  expect(progressColors().crypto).toBe('rgb(102, 102, 102)');
  expect(progressColors().done).toBe('rgb(255, 255, 255)');
});

it('uses dark progress ink on the White background', () => {
  document.documentElement.style.setProperty('--not3-bg', '255 255 255');
  document.documentElement.style.setProperty('--not3-fg', '0 0 0');
  document.documentElement.style.setProperty('--not3-accent', '0 0 0');
  expect(progressColors().read).toBe('rgb(204, 204, 204)');
  expect(progressColors().done).toBe('rgb(0, 0, 0)');
});
