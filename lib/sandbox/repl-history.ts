const MAX_HISTORY = 100;

type RunnerHistory = {
  commands: string[];
  cursor: number | null;
  draft: string;
};

/** In-memory command history scoped to one mounted sandbox panel. */
export function createReplHistory() {
  const runners = new Map<string, RunnerHistory>();
  const forRunner = (id: string): RunnerHistory => {
    let state = runners.get(id);
    if (!state) {
      state = { commands: [], cursor: null, draft: "" };
      runners.set(id, state);
    }
    return state;
  };

  return {
    record(id: string, command: string) {
      if (!command) return;
      const state = forRunner(id);
      state.commands.push(command);
      if (state.commands.length > MAX_HISTORY) state.commands.shift();
      state.cursor = null;
      state.draft = "";
    },
    navigate(id: string, direction: "up" | "down", currentInput: string): string {
      const state = forRunner(id);
      if (!state.commands.length) return currentInput;
      if (direction === "up") {
        if (state.cursor === null) {
          state.draft = currentInput;
          state.cursor = state.commands.length - 1;
        } else {
          state.cursor = Math.max(0, state.cursor - 1);
        }
        return state.commands[state.cursor]!;
      }
      if (state.cursor === null) return currentInput;
      if (state.cursor === state.commands.length - 1) {
        state.cursor = null;
        return state.draft;
      }
      return state.commands[++state.cursor]!;
    },
    switchRunner(fromId: string, toId: string, currentInput: string): string {
      if (fromId) {
        const previous = forRunner(fromId);
        if (previous.cursor === null) previous.draft = currentInput;
        previous.cursor = null;
      }
      return forRunner(toId).draft;
    },
  };
}
