import * as Actions from "~/lib/actions";

export interface EditorActionDefinition {
  /** Also the key used in settings.editor.keybindings */
  id: string;
  /** Label shown in the monaco command palette (F1) */
  label: string;
  run: () => void;
}

export const EDITOR_ACTIONS: EditorActionDefinition[] = [
  { id: "save", label: "!3: Save note", run: Actions.SAVE },
  { id: "saveUntilRead", label: "!3: Save (self-destruct after reading)", run: Actions.SAVE_UNTIL_READ },
  { id: "saveForCustomTime", label: "!3: Save with custom expiry", run: Actions.SAVE_FOR_CUSTOM_TIME },
  { id: "duplicate", label: "!3: Duplicate note", run: Actions.DUPLICATE },
  { id: "new", label: "!3: New note", run: Actions.NEW },
  { id: "download", label: "!3: Download note as file", run: Actions.DOWNLOAD },
  { id: "shareLink", label: "!3: Share link", run: Actions.SHARE_LINK },
  { id: "shareCurl", label: "!3: Share cURL command", run: Actions.SHARE_CURL },
  { id: "openSettings", label: "!3: Open settings", run: Actions.OPEN_SETTINGS },
  { id: "fileTransfer", label: "!3: File transfer", run: Actions.OPEN_FILE_TRANSFER },
  { id: "excalidraw", label: "!3: Open excalidraw", run: Actions.OPEN_EXCALIDRAW },
];
