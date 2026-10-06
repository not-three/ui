<template><tools-page v-if="tool" :tool="tool" /></template>

<script setup lang="ts">
import { getTool } from '~/lib/tools/registry';
import { computed } from 'vue';
const route = useRoute();
const tool = computed(() => getTool(String(route.params.id)));
if (!tool.value) await navigateTo('/t', { replace: true });
</script>
