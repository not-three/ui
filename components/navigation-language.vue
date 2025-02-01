<template>
  <div :key="store.selectedLanguage || undefined" class="border border-white px-2 py-0.5 -my-1 print:hidden">
    <select
      v-model="currentLanguage"
      class="bg-black text-white focus:outline-none cursor-pointer"
    >
      <option v-if="!store.detectedLanguage" value="" disabled>
        Language will be detected...
      </option>
      <option v-else-if="store.selectedLanguage" value="auto">Auto 🤖</option>
      <option
        v-for="lang in store.languageDefinitions"
        :key="lang.id"
        :value="lang.id"
      >
        {{ lang.id.substring(0, 1).toUpperCase() + lang.id.substring(1) }}
        {{ lang.id === store.detectedLanguage ? "✨" : "" }}
        {{ lang.id === store.selectedLanguage ? "🔒" : "" }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
const store = useAppStore();
const currentLanguage = computed({
  get: () => store.selectedLanguage || store.detectedLanguage,
  set: (value: string) => store.selectedLanguage = value === "auto" ? null : value,
});
</script>
