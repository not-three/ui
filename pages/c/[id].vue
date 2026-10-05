<template>
  <base-page :cowork-room="String(route.params.id)" />
</template>

<script setup lang="ts">
const route = useRoute()
</script>
