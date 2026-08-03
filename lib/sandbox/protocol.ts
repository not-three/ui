export const SANDBOX_CONSOLE_MESSAGE = "not3/sandbox/console";
export const SANDBOX_READY_MESSAGE = "not3/sandbox/ready";
export const SANDBOX_EVAL_MESSAGE = "not3/sandbox/eval";

export const CONSOLE_LEVELS = ["log", "info", "warn", "error", "debug", "clear"] as const;
export type ConsoleLevel = (typeof CONSOLE_LEVELS)[number];

export type SandboxConsoleMessage = {
  type: typeof SANDBOX_CONSOLE_MESSAGE;
  level: ConsoleLevel;
  args: string[];
};
export type SandboxReadyMessage = { type: typeof SANDBOX_READY_MESSAGE };
export type SandboxMessage = SandboxConsoleMessage | SandboxReadyMessage;

/**
 * Validate an untrusted postMessage payload from the sandbox iframe.
 * Returns null unless the payload carries the expected per-run token.
 */
export function parseSandboxMessage(data: unknown, token: string): SandboxMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as Record<string, unknown>;
  if (msg.token !== token) return null;
  if (msg.type === SANDBOX_READY_MESSAGE) return { type: SANDBOX_READY_MESSAGE };
  if (msg.type !== SANDBOX_CONSOLE_MESSAGE) return null;
  if (!CONSOLE_LEVELS.includes(msg.level as ConsoleLevel)) return null;
  if (!Array.isArray(msg.args)) return null;
  return {
    type: SANDBOX_CONSOLE_MESSAGE,
    level: msg.level as ConsoleLevel,
    args: msg.args.map((a) => (typeof a === "string" ? a : String(a))),
  };
}
