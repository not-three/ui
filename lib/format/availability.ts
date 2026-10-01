import { hasFormatter } from "./index";

export function canFormatNote(
  note: { readonly: boolean; settings: boolean; excalidraw: boolean },
  languageId: string,
): boolean {
  return !note.readonly && !note.settings && !note.excalidraw && hasFormatter(languageId);
}
