<template>
  <header class="w-full flex gap-2 bg-black text-white px-4 py-1 items-center min-w-0">
    <NuxtLink to="/" class="flex gap-2 items-center flex-shrink-0 hover:underline underline-offset-2 focus:outline-none focus-visible:underline" title="Back to the editor">
      <img src="/assets/img/icon.svg" class="h-5 w-5 border-white border" alt="!3">
      <span class="font-bold select-none">not-th.re</span>
    </NuxtLink>
    <div class="border-l-2 border-white/20 self-stretch" />
    <slot />
  </header>
</template>
