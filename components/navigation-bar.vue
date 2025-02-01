<template>
  <div class="w-screen flex gap-2 bg-black text-white px-4 py-1 items-center">
    <img
      id="logo"
      src="/assets/img/icon.svg"
      class="h-5 w-5 border-white border"
      alt="!3"
    >
    <h1 class="navigation-logo-text">not-th.re</h1>
    <navigation-entry v-for="entry in entries" :key="entry.name" :config="entry" />
    <div class="flex-grow" />
    <navigation-language />
    <navigation-expires />
  </div>
  <div v-if="store.settings" class="w-full px-2 py-1 bg-yellow-600 select-none">
    <p class="font-bold text-center animate-pulse">
      <icon name="lucide:wrench" class="mb-1 mr-2" />
      SETTINGS EDITOR
      <icon name="lucide:wrench" class="mb-1 ml-2" />
    </p>
  </div>
</template>

<script lang="ts" setup>
import { FragmentData, ShareGenerator } from '@not3/sdk';
import { OkDialog, TextOutputDialog, TimeDialog, YesNoDialog } from '~/lib/dialog';
import type { NavigationEntry } from '~/lib/navigation';
const store = useAppStore();
const settings = useSettingsStore();

const copy = (text: string) => navigator.clipboard.writeText(text);

const entries = computed<NavigationEntry[]>(() => [
  {
    name: "File",
    entries: [
      {
        name: "Save",
        onClick: () => {
          if (store.settings) try {
            const parsed = JSON.parse(store.content);
            settings.$patch(parsed);
            store.pushToRouter("/", true);
          } catch (e) {
            console.error(e);
            store.dialog = new OkDialog("Error", "Invalid JSON in settings editor.");
          } else store.saveEncryptedNote();
        },
      },
      {
        name: "Save for custom time",
        onClick: () => store.dialog = new TimeDialog(
          "Save for custom time",
          "How long should the note be saved?",
          24*60*60,
          store.info.maxStorageTimeDays * 24*60*60,
          (time) => store.saveEncryptedNote(time)
        ),
        disabled: store.settings,
        title: store.settings ? "Cant save settings for custom time" : undefined,
      },
      {
        name: "Save until read",
        onClick: () => store.saveEncryptedNote(undefined, true),
        disabled: store.settings,
        title: store.settings ? "Cant save settings until read" : undefined,
      },
      {
        name: "Download",
        onClick: () => {
          const lang = store.getCurrentLanguage();
          const type = lang.mimeTypes ? lang.mimeTypes[0] : "text/plain";
          const extension = lang.extensions ? lang.extensions[0] : ".txt";
          const rand = Math.random().toString(36).substring(7);
          const blob = new Blob([store.content], { type });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `not3-${rand}${extension}`;
          a.click();
        },
      },
      {
        name: "Duplicate",
        onClick: () => {
          const win = window.open("/#duplicate", "_blank");
          win?.focus();
          win?.addEventListener("message", (e) => {
            if (e.data === "get-content") win.postMessage({
              content: store.content,
              tag: 'set-content',
            }, "*");
          });
        },
      },
      {
        name: "New",
        onClick: () => store.pushToRouter("/"),
      },
    ],
  },
  {
    name: "Share",
    entries: [
      {
        name: "Copy Link",
        onClick: () => {
          store.dialog = new TextOutputDialog(
            "Share Link",
            "Copy the following link to share the note.",
            window.location.href,
          );
          copy(window.location.href);
        },
      },
      {
        name: "Copy cURL Command",
        onClick: () => {
          const fragment = FragmentData.fromURL(window.location.href);
          let apiUrl = fragment.server || store.config.baseURL;
          if (!apiUrl.startsWith("http")) apiUrl = window.location.origin + apiUrl;
          const cmd = new ShareGenerator({apiUrl}).noteCurl(store.id, fragment.seed);
          store.dialog = new TextOutputDialog(
            "cURL Command",
            "Copy the following cURL command to share the note.",
            cmd,
          );
          copy(cmd);
        }
      }
    ],
    disabled: !store.readonly,
  },
  {
    name: "Tools",
    entries: [
      {
        name: "Edit Settings",
        onClick: () => store.pushToRouter("/settings"),
        disabled: store.settings,
        title: store.settings ? "Settings editor is already open" : undefined,
      },
      {
        name: "Reset Settings",
        onClick: () => store.dialog = new YesNoDialog(
          "Reset Settings",
          "Are you sure you want to reset all settings?",
          () => {
            settings.$reset();
            window.location.reload();
          }
        ),
      },
      {
        name: "File Transfer",
        onClick: () => store.upload = true,
        disabled: !store.info.fileTransferEnabled,
      },
    ],
  },
  {
    name: "About",
    entries: [
      {
        name: "Github Repository",
        onClick: () => window.open("https://github.com/not-three/main", "_blank"),
      },
      {
        name: "Help (Github Issues)",
        onClick: () => window.open("https://github.com/not-three/main/issues", "_blank"),
      },
      {
        name: "Privacy and Terms",
        onClick: () => window.open(store.config.termsURL, "_blank"),
        disabled: !store.config.termsURL,
      },
    ],
  }
]);
</script>

<style>
.navigation-logo-text {
  @apply font-bold select-none transition-all duration-200;
  @apply max-w-0 -mr-1 overflow-hidden whitespace-pre;
  @apply print:max-w-32 print:mr-0
}
#logo:hover + h1 {
  @apply max-w-32 mr-0;
}
</style>
