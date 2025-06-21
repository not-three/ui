<template>
  <base-page :open-note="id" />
</template>

<script lang="ts" setup>
const id = useRoute().params.id as string;
</script>
