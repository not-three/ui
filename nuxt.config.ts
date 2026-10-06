// https://nuxt.com/docs/api/configuration/nuxt-config
import { themeBootstrapScript, themeBootstrapStyle } from './lib/theme/bootstrap';
import { THEMES, themeColor } from './lib/theme/registry';

// @vscode/vscode-languagedetection loads its only extra chunk (the TensorFlow
// CPU backend) through webpack's dynamic `require("./" + chunk)`, which
// Rolldown cannot bundle, so the model failed at runtime and detection fell
// back to the regex patterns. Naming the chunk literally lets it be bundled.
const languageDetectionChunk = {
  name: "not3:language-detection-chunk",
  transform(code: string, id: string) {
    if (!id.includes("vscode-languagedetection/dist/lib/index.js")) return null;
    return code.replace('require("./"+r.u(e))', 'require("./979.js")');
  },
};

export default defineNuxtConfig({
  css: ["~/assets/css/theme.css", "~/assets/css/scrollbar.css", "~/assets/css/panel.css"],
  app: {
    head: {
      charset: "utf-8",
      title: "not-th.re - encrypted notes",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: [
            "Simple client-side encrypted notes paired with",
            "the known monaco editor. Open source and free.",
          ].join(" "),
        },
        { name: "format-detection", content: "telephone=no" },
        { name: "msapplication-TileColor", content: "#000000" },
        { name: "theme-color", content: themeColor(THEMES[0]!) },
      ],
      style: [{ innerHTML: themeBootstrapStyle }],
      script: [{ innerHTML: themeBootstrapScript }],
    },
  },
  runtimeConfig: {
    public: {
      uiBaseURL: process.env.NUXT_APP_BASE_URL || '/',
    },
  },
  appConfig: {},
  // The note-runner "Run / Preview" panel executes note code inside an
  // `<iframe sandbox="allow-scripts allow-modals">` with NO `allow-same-origin`,
  // so the iframe has a permanently opaque ("null") origin. That makes it
  // cross-origin to *everything*, including our own server, even though the
  // interpreter assets under /vendor are served from our own origin. Classic
  // `<script src>` tags still load in no-cors mode, but `fetch()` and dynamic
  // `import()` (used by several runners to load .wasm/.mjs interpreter
  // modules) are blocked by CORS unless the response carries an
  // Access-Control-Allow-Origin header. These are public, credential-free
  // interpreter binaries — exactly what a CDN would serve with `ACAO: *` —
  // and no cookies or user data are reachable through /vendor, so a wildcard
  // is safe here. Mirrors the same header set in entrypoint/index.mjs for
  // the production Docker server; this covers `nuxt dev` / nitro-served
  // builds. Scoped to /vendor only.
  routeRules: {
    "/vendor/**": {
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/icon",
  ],
  piniaPluginPersistedstate: { storage: 'localStorage' },
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: "2024-10-19",
  vite: {
    plugins: [languageDetectionChunk],
    optimizeDeps: {
      rolldownOptions: {
        plugins: [languageDetectionChunk],
      },
    },
    worker: {
      format: "es",
    },
    server: {
      allowedHosts: true,
    },
    resolve: {
      alias: {
        // y-monaco still imports monaco's pre-0.56 deep path, which the
        // package's exports map no longer exposes; point it at the same module.
        "monaco-editor/esm/vs/editor/editor.api.js": "monaco-editor/editor/editor.api.js",
      },
    },
  },
});
