// Runner execution plus navigation integration. Deeper app e2e (popout window,
// mobile split, save/load against ../api's docker-compose) is a possible follow-up suite.
//
// Why a real browser: the unit suite can only string-match generated HTML, and
// every bug this suite exists for (UMD-vs-ESM loads, php-wasm's Web Locks
// rejection in an opaque origin, Babel leaving ES module syntax alone, the Vue
// prod build swallowing warnings) is invisible to string matching. The runners
// need real wasm, a real CSP and a real opaque-origin iframe.
import { defineConfig } from "@playwright/test";
import { drawCheckout } from "./draw-path.mjs";
import { runnerPorts } from "./ports.mjs";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 120_000, // pyodide/php-wasm boots are slow on first load
  fullyParallel: true,
  workers: 2,
  use: { baseURL: runnerPorts.staticOrigin },
  webServer: [
    {
      // Relative to this config's directory; serve.mjs finds the repo root
      // from its own URL, so it does not care about the cwd.
      command: "node serve.mjs",
      port: runnerPorts.staticPort,
      reuseExistingServer: false,
    },
    {
      command: `pnpm --dir ../.. exec nuxt dev --host 127.0.0.1 --port ${runnerPorts.appPort}`,
      port: runnerPorts.appPort,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    ...(drawCheckout ? [{
      command: "node serve-draw.mjs",
      port: runnerPorts.drawPort,
      reuseExistingServer: false,
      timeout: 120_000,
    }] : []),
  ],
});
