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

export default defineConfig({
  testDir: ".",
  timeout: 120_000, // pyodide/php-wasm boots are slow on first load
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:8788" },
  webServer: [
    {
      // Relative to this config's directory; serve.mjs finds the repo root
      // from its own URL, so it does not care about the cwd.
      command: "node serve.mjs",
      port: 8788,
      reuseExistingServer: true,
    },
    {
      command: "pnpm --dir ../.. exec nuxt dev --host 127.0.0.1 --port 8789",
      port: 8789,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    ...(drawCheckout ? [{
      command: "node serve-draw.mjs",
      port: 8790,
      reuseExistingServer: true,
      timeout: 120_000,
    }] : []),
  ],
});
