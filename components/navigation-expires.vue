<template>
  <icon v-if="value" name="lucide:alarm-clock" class="ml-4 print:hidden" />
  <p v-if="value" class="font-mono print:hidden">{{ value }}</p>
</template>

<script lang="ts" setup>
const store = useAppStore();
const value = ref('');
const interval = ref(0);

function doUpdate() {
  if (!store.expires) return value.value = '';
  const diff = store.expires.getTime() - Date.now();
  if (diff <= 0) return value.value = '00:00:00';
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor(diff / 1000 / 60) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  value.value = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

onMounted(() => {
  doUpdate();
  interval.value = window.setInterval(doUpdate, 1000);
})

onUnmounted(() => {
  window.clearInterval(interval.value);
})
</script>
