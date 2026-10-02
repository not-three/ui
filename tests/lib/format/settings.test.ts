import { describe, expect, it } from "vitest";
import { migrateSettings } from "~/lib/settings-migration";

describe("settings migration", () => {
  it("adds the format binding to version 2 settings without changing existing values", () => {
    const old = {
      version: 2,
      customServer: { url: "https://example.test", password: "secret" },
      editor: { tabSize: 4, keybindings: { save: "alt+s", new: "" } },
    };
    expect(migrateSettings(old)).toEqual({
      version: 3,
      customServer: { url: "https://example.test", password: "secret" },
      editor: {
        tabSize: 4,
        keybindings: { save: "alt+s", new: "", format: "shift+alt+f" },
      },
    });
  });

  it("keeps a customized format binding in current settings", () => {
    const current = { version: 3, editor: { keybindings: { format: "ctrl+shift+f" } } };
    expect(migrateSettings(current)).toEqual(current);
  });
});
