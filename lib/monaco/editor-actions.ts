import * as Actions from "~/lib/actions";

export interface EditorActionDefinition {
  /** Shared command id used by page, Monaco and draw. */
  id: string;
  /** Label shown in the monaco command palette (F1) */
  label: string;
  run: () => void;
}

export const EDITOR_ACTIONS: EditorActionDefinition[] = [
  { id: "not3.save", label: "!3: Save note", run: Actions.SAVE },
  { id: "not3.saveUntilRead", label: "!3: Save (self-destruct after reading)", run: Actions.SAVE_UNTIL_READ },
  { id: "not3.saveForCustomTime", label: "!3: Save with custom expiry", run: Actions.SAVE_FOR_CUSTOM_TIME },
  { id: "not3.duplicate", label: "!3: Duplicate note", run: Actions.DUPLICATE },
  { id: "not3.new", label: "!3: New note", run: Actions.NEW },
  { id: "not3.download", label: "!3: Download note as file", run: Actions.DOWNLOAD },
  { id: "not3.format", label: "!3: Format note", run: Actions.FORMAT },
  { id: "not3.shareLink", label: "!3: Share link", run: Actions.SHARE_LINK },
  { id: "not3.shareCurl", label: "!3: Share cURL command", run: Actions.SHARE_CURL },
  { id: "not3.openSettings", label: "!3: Open settings", run: Actions.OPEN_SETTINGS },
  { id: "not3.fileTransfer", label: "!3: File transfer", run: Actions.OPEN_FILE_TRANSFER },
  { id: "not3.excalidraw", label: "!3: Open excalidraw", run: Actions.OPEN_EXCALIDRAW },
  { id: "not3.sandbox", label: "!3: Run / preview note", run: Actions.OPEN_SANDBOX },
  { id: "not3.openKeybindings", label: "!3: Show keybindings", run: Actions.OPEN_KEYBINDINGS },
];

export function dispatchNot3Action(command: string): boolean {
  const action = EDITOR_ACTIONS.find((item) => item.id === command);
  if (!action) return false;
  action.run();
  return true;
}
