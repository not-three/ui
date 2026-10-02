/**
 * Panel-lifetime memory for the auto-run checkbox. Language detection can
 * flip the active runner while the user types; without memory the checkbox
 * silently resets to the runner's `!heavy` default on every flip.
 */
export function resolveAutoRun(
  memory: Map<string, boolean>,
  previousId: string | null,
  currentAuto: boolean,
  next: { id: string; heavy?: boolean },
): boolean {
  if (previousId) memory.set(previousId, currentAuto);
  return memory.get(next.id) ?? !next.heavy;
}
