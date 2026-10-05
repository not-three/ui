import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  use: { baseURL: 'http://127.0.0.1:18889', browserName: 'chromium' },
  webServer: [
    { command: 'node serve.mjs', port: 18890, reuseExistingServer: false },
    { command: 'pnpm --dir ../.. exec nuxt dev --host 127.0.0.1 --port 18889', port: 18889, reuseExistingServer: false, timeout: 120_000 },
  ],
})
