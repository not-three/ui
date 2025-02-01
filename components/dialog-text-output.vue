<template>
  <input
    ref="input"
    type="text"
    :value="data.value"
    readonly
    class="w-full"
  >
  <div class="text-right mt-2">
    <button @click="onOk()">
      <span class="underline font-bold">O</span>
      <span>k</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { TextOutputDialog } from '~/lib/dialog';
const emit = defineEmits(["close"]);
const props = defineProps<{
  data: TextOutputDialog;
}>();
const input = ref() as Ref<HTMLInputElement>;

function onOk() {
  emit('close');
  props.data.onOk();
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case 'Escape':
    case 'o':
    case 'y':
      event.preventDefault();
      event.stopPropagation();
      onOk();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  input.value.focus();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
