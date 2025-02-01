import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    // https://v3-migration.vuejs.org/new/fragments.html
    "vue/no-multiple-template-root": "off",
  }
});
