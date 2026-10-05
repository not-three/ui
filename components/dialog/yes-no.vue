<template>
  <div class="flex justify-end gap-4">
    <button @click="onYes()">
      {{ data.yesLabel }}
    </button>
    <button @click="onNo()">
      {{ data.noLabel }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { YesNoDialog } from '~/lib/dialog';
const emit = defineEmits(["close"]);
const props = defineProps<{
  data: YesNoDialog;
}>();

function onYes() {
  emit('close');
  props.data.onYes();
}

function onNo() {
  emit('close');
  props.data.onNo();
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case 'y':
      event.preventDefault();
      event.stopPropagation();
      onYes();
      break;
    case 'Backspace':
    case 'Escape':
    case 'n':
      event.preventDefault();
      event.stopPropagation();
      onNo();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
