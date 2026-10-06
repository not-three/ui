import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const drawRepo = [resolve(here, '../../../draw'), resolve(here, '../../../../../draw')].find(path => existsSync(resolve(path, 'package.json')))
if (!drawRepo) throw new Error('Could not find the sibling draw repository')

export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  use: { baseURL: 'http://127.0.0.1:18889', browserName: 'chromium' },
  webServer: [
    { command: 'node serve.mjs', port: 18890, reuseExistingServer: false },
    { command: `pnpm --dir '${drawRepo}' exec vite --host 127.0.0.1 --port 18891`, port: 18891, reuseExistingServer: false, timeout: 120_000 },
    { command: 'pnpm --dir ../.. exec nuxt dev --host 127.0.0.1 --port 18889', port: 18889, reuseExistingServer: false, timeout: 120_000 },
  ],
})
