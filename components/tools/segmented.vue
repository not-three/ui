<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex flex-wrap text-xs"
  >
    <button
      v-for="(item, index) in items"
      :key="item.value"
      ref="buttons"
      type="button"
      role="radio"
      :value="item.value"
      :aria-checked="item.value === modelValue"
      :disabled="item.disabled"
      :tabindex="item.value === modelValue || (index === 0 && !selectedEnabled) ? 0 : -1"
      class="border border-white/40 px-2 py-0.5 -ml-px first:ml-0 focus:outline-none focus-visible:border-white focus-visible:relative"
      :class="item.value === modelValue ? 'bg-white/20' : item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'"
      @click="select(item)"
      @keydown.left.prevent="move(index, -1)"
      @keydown.up.prevent="move(index, -1)"
      @keydown.right.prevent="move(index, 1)"
      @keydown.down.prevent="move(index, 1)"
    >{{ item.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

/**
 * A row of joined buttons that behaves like a radio group: exactly one item is
 * active and picking another releases the previous one. Replaces small
 * dropdowns, which feel clunky for two to four choices.
 */
export interface SegmentedItem { value: string; label: string; disabled?: boolean }

const props = defineProps<{ modelValue: string; items: SegmentedItem[]; label: string }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>();

const buttons = ref<HTMLButtonElement[]>([]);
const selectedEnabled = computed(() => props.items.some(item => item.value === props.modelValue && !item.disabled));

function select(item: SegmentedItem) {
  if (item.disabled || item.value === props.modelValue) return;
  emit('update:modelValue', item.value);
}

function move(from: number, step: number) {
  const count = props.items.length;
  for (let offset = 1; offset <= count; offset++) {
    const item = props.items[(from + step * offset + count * offset) % count];
    if (item && !item.disabled) {
      select(item);
      buttons.value[props.items.indexOf(item)]?.focus();
      return;
    }
  }
}
</script>
