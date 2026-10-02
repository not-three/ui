/**
 * Opener <-> popout window protocol. Both ends are OUR app on OUR origin —
 * callers must still check `event.origin === window.location.origin` and the
 * exact `event.source` window before trusting a message; this module only
 * validates shape. Note plaintext flows opener -> popup ONLY.
 */
export const POPOUT_READY_MESSAGE = "not3/popout/ready";
export const POPOUT_STATE_MESSAGE = "not3/popout/state";
export const POPOUT_ENGINE_MESSAGE = "not3/popout/engine";

export type PopoutReadyMessage = { type: typeof POPOUT_READY_MESSAGE };
export type PopoutStateMessage = {
  type: typeof POPOUT_STATE_MESSAGE;
  content: string;
  languageId: string;
};
export type PopoutEngineMessage = {
  type: typeof POPOUT_ENGINE_MESSAGE;
  engineId: "sql-sqljs" | "sql-pglite";
};

export function parsePopoutMessage(
  data: unknown,
): PopoutReadyMessage | PopoutStateMessage | PopoutEngineMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as Record<string, unknown>;
  if (msg.type === POPOUT_READY_MESSAGE) return { type: POPOUT_READY_MESSAGE };
  if (msg.type === POPOUT_ENGINE_MESSAGE) {
    if (msg.engineId !== "sql-sqljs" && msg.engineId !== "sql-pglite") return null;
    return { type: POPOUT_ENGINE_MESSAGE, engineId: msg.engineId };
  }
  if (msg.type !== POPOUT_STATE_MESSAGE) return null;
  if (typeof msg.content !== "string" || typeof msg.languageId !== "string") return null;
  return { type: POPOUT_STATE_MESSAGE, content: msg.content, languageId: msg.languageId };
}

// The popup handle is deliberately module-scope, not pinia state: Window is
// not serializable and must never end up in devtools/persistence.
let popoutWindow: Window | null = null;

export function setPopoutWindow(win: Window | null): void {
  popoutWindow = win;
}

export function getPopoutWindow(): Window | null {
  return popoutWindow;
}

export function closePopoutWindow(): void {
  try {
    popoutWindow?.close();
  } catch {
    /* already dead */
  }
  popoutWindow = null;
}
