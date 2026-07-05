// Helpers for the global "drop a file anywhere to start a transfer" zone.
// Kept as pure functions so the decision logic is unit-testable without a DOM.

/**
 * True when a drag carries OS files (as opposed to, e.g., text dragged inside
 * the editor). The DataTransfer exposes "Files" in its `types` for file drags.
 */
export function isFileDrag(types: readonly string[] | undefined): boolean {
  return !!types && Array.from(types).includes("Files");
}

/**
 * Whether a file drop should open the transfer. Mirrors the guards of the
 * toolbar's "file transfer" action: the server must allow transfers, and we
 * must not hijack the settings editor or interrupt an in-progress upload.
 */
export function canStartDropUpload(opts: {
  fileTransferEnabled: boolean;
  settingsOpen: boolean;
  uploadActive: boolean;
}): boolean {
  return (
    opts.fileTransferEnabled && !opts.settingsOpen && !opts.uploadActive
  );
}
