import type { CompiledKeybindings, MonacoRule } from "~/lib/keybindings/compile";

export function createMonacoKeybindingAdapter(
  addRules: (rules: MonacoRule[]) => { dispose(): void },
) {
  let installed: { dispose(): void } | null = null;
  return {
    apply(compiled: CompiledKeybindings) {
      installed?.dispose();
      installed = addRules(compiled.monacoRules);
    },
    dispose() {
      installed?.dispose();
      installed = null;
    },
  };
}
