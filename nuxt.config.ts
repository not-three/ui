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
          hid: "description",
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
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: "2024-10-19",
  vite: {
    worker: {
      format: "es",
    },
    build: {
      
    }
  },
});
