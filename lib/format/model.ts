import type { editor } from "monaco-editor";
import { format, type FormatOptions } from "./index";

/** Returns false when the model changed while the formatter was loading. */
export async function formatModel(
  model: editor.ITextModel,
  languageId: string,
  options: FormatOptions,
  canApply: () => boolean = () => true,
): Promise<boolean> {
  const version = model.getVersionId();
  const formatted = await format(languageId, model.getValue(), options);
  if (model.isDisposed() || model.getVersionId() !== version || !canApply()) return false;
  if (formatted === model.getValue()) return true;

  model.pushStackElement();
  model.pushEditOperations(
    [],
    [{ range: model.getFullModelRange(), text: formatted }],
    () => null,
  );
  model.pushStackElement();
  return true;
}
