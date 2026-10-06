<template>
  <header class="w-full flex gap-2 bg-black text-white px-4 py-1 items-center min-w-0">
    <img
      id="logo"
      src="/assets/img/icon.svg"
      class="h-5 w-5 border-white border"
      alt="!3"
    >
    <h1 class="navigation-logo-text">not-th.re</h1>
    <NuxtLink to="/" class="border border-white px-2 py-0.5 -my-1 flex-shrink-0 hover:bg-white/10 focus:outline-none focus-visible:bg-white/10" title="Back to the editor">Back to editor</NuxtLink>
    <div class="border-l border-white/20 self-stretch" />
    <slot />
    <div class="flex-grow" />
  </header>
</template>

<script setup lang="ts">
// The logo and its hover-revealed name behave exactly like the editor's title
// bar: decorative, no click. Navigation back happens through the explicit
// button next to the name, which is what the editor's own bar has no need for.
</script>
