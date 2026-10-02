import type { editor } from "monaco-editor";
import { canFormatNote } from "~/lib/format/availability";
import { formatModel } from "~/lib/format/model";

let activeEditor: editor.IStandaloneCodeEditor | null = null;

export function registerFormatEditor(editorInstance: editor.IStandaloneCodeEditor | null) {
  activeEditor = editorInstance;
}

export async function FORMAT(): Promise<void> {
  const app = useAppStore();
  const editorInstance = activeEditor;
  const language = app.getCurrentLanguage().id;
  if (!editorInstance || !canFormatNote(app, language)) return;
  const model = editorInstance.getModel();
  if (!model) return;

  const selection = editorInstance.getSelection();
  const scrollTop = editorInstance.getScrollTop();
  const scrollLeft = editorInstance.getScrollLeft();
  try {
    const changed = await formatModel(model, language, {
      tabWidth: useSettingsStore().editor.tabSize,
      sqlDialect: app.sandboxEngineId === "sql-pglite" ? "postgresql" : "sql",
    }, () => activeEditor === editorInstance &&
      editorInstance.getModel() === model &&
      app.getCurrentLanguage().id === language &&
      canFormatNote(app, language));
    if (!changed || activeEditor !== editorInstance || editorInstance.getModel() !== model) return;
    if (selection) editorInstance.setSelection(selection);
    editorInstance.setScrollTop(scrollTop);
    editorInstance.setScrollLeft(scrollLeft);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    useNotificationStore().show(`Could not format note: ${message}`);
  }
}
