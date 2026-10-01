import { describe, expect, it } from "vitest";
import { canFormatNote } from "~/lib/format/availability";

describe("canFormatNote", () => {
  it("permits an editable note in a supported language", () => {
    expect(canFormatNote({ readonly: false, settings: false, excalidraw: false }, "typescript")).toBe(true);
  });

  it.each([
    [{ readonly: true, settings: false, excalidraw: false }, "typescript"],
    [{ readonly: false, settings: true, excalidraw: false }, "typescript"],
    [{ readonly: false, settings: false, excalidraw: true }, "typescript"],
    [{ readonly: false, settings: false, excalidraw: false }, "python"],
  ])("hides format for unavailable notes", (note, language) => {
    expect(canFormatNote(note, language)).toBe(false);
  });
});
