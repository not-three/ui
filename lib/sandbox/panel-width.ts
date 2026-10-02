const DEFAULT_WIDTH_PCT = 50;
const MIN_WIDTH_PCT = 20;
const MAX_WIDTH_PCT = 80;

export function clampPanelWidthPct(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_WIDTH_PCT;
  return Math.min(MAX_WIDTH_PCT, Math.max(MIN_WIDTH_PCT, value));
}

export function loadPanelWidth(settings: { sandbox?: { panelWidthPct?: unknown } }): number {
  return clampPanelWidthPct(settings.sandbox?.panelWidthPct);
}

export function savePanelWidth(settings: { sandbox?: { panelWidthPct: number } }, widthPct: number): void {
  const value = clampPanelWidthPct(widthPct);
  if (settings.sandbox) settings.sandbox.panelWidthPct = value;
  else settings.sandbox = { panelWidthPct: value };
}
