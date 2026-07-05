import { describe, expect, it } from "vitest";
import { canStartDropUpload, isFileDrag } from "~/lib/transfer/drop";

describe("isFileDrag", () => {
  it("is true when the drag carries files", () => {
    expect(isFileDrag(["Files"])).toBe(true);
    expect(isFileDrag(["text/plain", "Files"])).toBe(true);
  });

  it("is false for text drags (e.g. selection dragged inside the editor)", () => {
    expect(isFileDrag(["text/plain"])).toBe(false);
    expect(isFileDrag([])).toBe(false);
    expect(isFileDrag(undefined)).toBe(false);
  });
});

describe("canStartDropUpload", () => {
  it("allows a drop when transfers are enabled and nothing blocks it", () => {
    expect(
      canStartDropUpload({
        fileTransferEnabled: true,
        settingsOpen: false,
        uploadActive: false,
      }),
    ).toBe(true);
  });

  it("blocks when the server disabled file transfer", () => {
    expect(
      canStartDropUpload({
        fileTransferEnabled: false,
        settingsOpen: false,
        uploadActive: false,
      }),
    ).toBe(false);
  });

  it("blocks while the settings editor is open", () => {
    expect(
      canStartDropUpload({
        fileTransferEnabled: true,
        settingsOpen: true,
        uploadActive: false,
      }),
    ).toBe(false);
  });

  it("blocks while an upload is already in progress", () => {
    expect(
      canStartDropUpload({
        fileTransferEnabled: true,
        settingsOpen: false,
        uploadActive: true,
      }),
    ).toBe(false);
  });
});
