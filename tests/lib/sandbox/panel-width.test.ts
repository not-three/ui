import { describe, expect, it } from "vitest";
import { loadPanelWidth, savePanelWidth } from "~/lib/sandbox/panel-width";

describe("sandbox panel width", () => {
  it("loads the default and clamps persisted widths into the 20–80 range", () => {
    expect(loadPanelWidth({})).toBe(50);
    expect(loadPanelWidth({ sandbox: { panelWidthPct: -10 } })).toBe(20);
    expect(loadPanelWidth({ sandbox: { panelWidthPct: 120 } })).toBe(80);
    expect(loadPanelWidth({ sandbox: { panelWidthPct: Number.NaN } })).toBe(50);
    expect(loadPanelWidth({ sandbox: { panelWidthPct: 35 } })).toBe(35);
  });

  it("saves a resized width to the persisted settings shape", () => {
    const settings = { sandbox: { panelWidthPct: 50 } };
    savePanelWidth(settings, 67.5);
    expect(settings.sandbox.panelWidthPct).toBe(67.5);
    savePanelWidth(settings, 95);
    expect(settings.sandbox.panelWidthPct).toBe(80);
  });

  it("saves after loading settings persisted before the sandbox key existed", () => {
    const settings: { sandbox?: { panelWidthPct: number } } = {};
    savePanelWidth(settings, 42);
    expect(settings.sandbox?.panelWidthPct).toBe(42);
  });
});
