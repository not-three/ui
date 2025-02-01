<template>
  <aaa-base-page :open-file="id" />
</template>

<script lang="ts" setup>
const id = useRoute().params.id as string;
</script>
