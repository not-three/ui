import { describe, expect, it } from "vitest";
import { migrateSettings } from "~/lib/settings-migration";

describe("settings migration", () => {
  it("migrates every old binding including empty unbindings and preserves other settings", () => {
    const old = {
      version: 2,
      customServer: { url: "https://example.test", password: "secret" },
      editor: { tabSize: 4, keybindings: { save: "alt+s", new: "" } },
    };
    expect(migrateSettings(old)).toEqual({
      version: 4,
      customServer: { url: "https://example.test", password: "secret" },
      editor: { tabSize: 4 },
      keybindings: [
        { key: "alt+s", command: "not3.save" },
        { key: "ctrl+alt+n", command: "-not3.new" },
      ],
    });
  });

  it("migrates version 3 and leaves version 4 unchanged", () => {
    const current = { version: 3, editor: { keybindings: { format: "ctrl+shift+f" } } };
    expect(migrateSettings(current)).toEqual({ version: 4, editor: {}, keybindings: [{ key: "ctrl+shift+f", command: "not3.format" }] });
    const migrated = migrateSettings(current);
    expect(migrateSettings(migrated)).toEqual(migrated);
  });
});
