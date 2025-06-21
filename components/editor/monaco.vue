<template>
  <div ref="container" class="w-full flex-grow relative">
    <editor-excalidraw v-if="store.excalidraw" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, type Ref } from "vue";
import { buildWorkerDefinition } from "monaco-editor-workers";
import { detectLanguageFromContent, debounce } from "~/lib/monaco/utils";
import { setupMonaco } from "~/lib/monaco/setup";
import { YesNoDialog } from "~/lib/dialog";
import * as Actions from "~/lib/actions";
import * as monaco from "monaco-editor";

const store = useAppStore();
const emit = defineEmits(["loaded"]);
const container = ref() as Ref<HTMLDivElement>;
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const currentLanguage = ref<string>("plaintext");

const setEditorLanguage = (languageId: string) => {
  if (currentLanguage.value === languageId) return;
  if (editor && editor.getModel()) {
    console.log("Setting language:", languageId);
    currentLanguage.value = languageId;
    monaco.editor.setModelLanguage(editor.getModel()!, languageId);
  }
};

const updateLanguage = debounce((content: string) => {
  if (editor) {
    const detectedLanguage = detectLanguageFromContent(content);
    store.detectedLanguage = detectedLanguage;
    if (!store.selectedLanguage) setEditorLanguage(detectedLanguage);
  }
}, 500);

onMounted(async () => {
  buildWorkerDefinition(
    "../node_modules/monaco-editor-workers/dist/workers",
    import.meta.url,
    false,
  );

  await setupMonaco();

  const initialDetectedLanguage = detectLanguageFromContent(store.content);
  store.detectedLanguage = initialDetectedLanguage;
  const initialLanguage = store.selectedLanguage || initialDetectedLanguage;
  currentLanguage.value = initialLanguage;
  const model = monaco.editor.createModel(store.content, initialLanguage);

  editor = monaco.editor.create(container.value, {
    model,
    theme: "vs-dark",
    readOnly: store.readonly,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: "on",
    lineNumbers: "on",
  });

  // Register keyboard shortcuts
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, Actions.SAVE);
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, Actions.DUPLICATE);
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, Actions.NEW);

  // Handle content changes
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || "";
    store.content = value;
    updateLanguage(value);
  });

  // Handle edit while readonly
  editor.onDidAttemptReadOnlyEdit(() => {
    store.dialog = new YesNoDialog(
      "Warning",
      "This note is read-only. Do you want to make it editable?",
      () => {
        store.keepContent = true;
        store.pushToRouter("/");
      },
    );
  });

  emit("loaded");
});

onBeforeUnmount(() => {
  editor?.dispose();
});

// Watch for prop changes
watch(
  () => store.readonly,
  (value) => {
    editor?.updateOptions({ readOnly: !!value });
  },
);

watch(
  () => store.content,
  (newValue, oldValue) => {
    if (newValue === oldValue || newValue === editor?.getValue()) return;
    editor?.setValue(newValue);
    updateLanguage(newValue);
  },
);

watch(
  () => store.selectedLanguage,
  (newLanguage) => {
    if (!editor) return;
    if (newLanguage) setEditorLanguage(newLanguage);
    else setEditorLanguage(detectLanguageFromContent(editor.getValue()));
  },
);
</script>
