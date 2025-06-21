<template>
  <div class="notification-wrapper">
    <div
      class="transition-transform duration-500 ease-in-out"
      :class="store.progress ? '' : 'translate-x-full'"
    >
      <div class="notification-container">
        <p>{{ store.message }}</p>
        <div
          v-if="store.progress"
          class="border-b-4 border-white absolute inset-0"
          :style="{ width: `${store.progress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const store = useNotificationStore();
</script>

<style>
.notification-wrapper {
  @apply fixed inset-0 h-screen pointer-events-none;
  @apply flex flex-col items-end z-50 pt-12 translate-x-1;
}
.notification-container {
  @apply max-w-md bg-black border-white border-2 px-8 py-4;
  @apply relative mr-4;
}
</style>
