<template><tools-page v-if="tool" :tool="tool" /></template>

<script setup lang="ts">
import { getTool } from '~/lib/tools/registry';
const route = useRoute();
const tool = getTool(String(route.params.id));
if (!tool) await navigateTo('/t', { replace: true });
</script>
