import { afterEach, expect, it, vi } from 'vitest';

vi.mock('@playwright/test', () => ({ defineConfig: (config: unknown) => config }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('defaults the browser suite to two workers', async () => {
  vi.stubEnv('NOT3_RUNNER_WORKERS', undefined);
  vi.resetModules();
  expect((await import('./playwright.config')).default.workers).toBe(2);
});

it('accepts a positive integer worker override', async () => {
  vi.stubEnv('NOT3_RUNNER_WORKERS', '3');
  vi.resetModules();
  expect((await import('./playwright.config')).default.workers).toBe(3);
});

it.each(['', '0', '-1', '2.5', ' 2', 'abc', '9007199254740992'])(
  'rejects invalid worker override %j', async (value) => {
    vi.stubEnv('NOT3_RUNNER_WORKERS', value);
    vi.resetModules();
    await expect(import('./playwright.config')).rejects.toThrow(/NOT3_RUNNER_WORKERS/);
  },
);
