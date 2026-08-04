// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/css/scrollbar.css"],
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
        { name: "theme-color", content: "#000000" },
      ],
      style: [{ innerHTML: "body { background-color: #000; color: #fff; }" }],
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
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: "2024-10-19",
  vite: {
    worker: {
      format: "es",
    },
    server: {
      allowedHosts: true,
    },
  },
});