<template>
  <div class="border-l border-white/20 h-full content-[''] print:hidden" />
  <div ref="container" class="relative print:hidden z-20">
    <h2
      tabindex="0"
      class="select-none underline-offset-2"
      :class="{
        'brightness-50 cursor-not-allowed': config.disabled,
        'hover:underline cursor-pointer': !config.disabled,
      }"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      {{ config.name }}
    </h2>
    <div
      class="absolute inset-x-0 bottom-0 flex justify-start items-center pointer-events-none"
    >
      <transition-fade>
        <div
          v-if="active"
          class="translate-y-full overflow-visible z-10 flex flex-col items-start pointer-events-auto"
        >
          <div
            class="w-0 h-0 border-x-[1rem] border-x-transparent border-b-[1rem] border-b-black mt-2"
          />
          <div class="bg-black p-2">
            <div v-for="entry in config.entries" :key="entry.name">
              <button
                :disabled="entry.disabled"
                class="w-full text-left whitespace-nowrap bg-white/5 my-1 px-2 py-1 transition-colors"
                :class="entry.disabled ? 'cursor-not-allowed line-through' : 'hover:bg-white/10'"
                :title="entry.title ? entry.title : entry.disabled ? 'This action is disabled by config or the server.' : ''"
                :aria-expanded="entry.entries ? openSubmenu === entry.name : undefined"
                @click="entry.entries ? toggleSubmenu(entry.name) : execFunction(entry.onClick)"
              >
                <span>{{ entry.name + (entry.entries ? ' ' : '') }}</span><span
                  v-if="entry.entries"
                  class="inline-block ml-1 transition-transform duration-150"
                  :class="{ 'rotate-90': openSubmenu === entry.name }"
                >▸</span>
              </button>
              <div v-if="entry.entries && openSubmenu === entry.name" :role="entry.entries.some(child => child.checked !== undefined) ? 'radiogroup' : undefined" :aria-label="entry.name" class="pl-3 border-l border-white/30">
                <button v-for="child in entry.entries" :key="child.name" :role="child.checked === undefined ? undefined : 'radio'" :aria-checked="child.checked" class="w-full text-left whitespace-nowrap bg-white/5 my-1 px-2 py-1 hover:bg-white/10" @click="execFunction(child.onClick)"><span v-if="child.checked !== undefined" aria-hidden="true" class="inline-block w-5">{{ child.checked ? '●' : '' }}</span>{{ child.name }}</button>
              </div>
            </div>
          </div>
        </div>
      </transition-fade>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationEntry } from '~/lib/navigation';

const container = ref() as Ref<HTMLDivElement>;
const active = ref(false);
/** Only one category submenu is open at a time; opening another closes the previous one. */
const openSubmenu = ref<string | null>(null);
const props = defineProps<{config: NavigationEntry}>();

function toggle() {
  active.value = props.config.disabled ? false : !active.value;
  if (!active.value) openSubmenu.value = null;
}

function toggleSubmenu(name: string) {
  openSubmenu.value = openSubmenu.value === name ? null : name;
}

function outsideClickListener(event: MouseEvent | TouchEvent) {
  if (!container.value.contains(event.target as Node)) {
    active.value = false;
    openSubmenu.value = null;
  }
}

function execFunction(fn?: () => void) {
  active.value = false;
  openSubmenu.value = null;
  fn?.();
}

onMounted(() => {
  window.addEventListener("click", outsideClickListener);
  window.addEventListener("touchstart", outsideClickListener);
});

onUnmounted(() => {
  window.removeEventListener("click", outsideClickListener);
  window.removeEventListener("touchstart", outsideClickListener);
});
</script>
