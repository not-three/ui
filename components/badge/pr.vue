<template>
  <badge-base
    v-if="store.config.pullRequest"
    :text="
      [
        'This is an preview of an pull request.',
        'Click here to view the pull request.',
      ].join('\n')
    "
    :to="store.config.pullRequest"
  />
</template>

<script lang="ts" setup>
const store = useAppStore();
</script>
