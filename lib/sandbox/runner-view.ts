import type { SandboxRunner } from "./runners/types";

/** The tab shown whenever a runner starts or is selected. */
export function initialRunnerView(
  runner: Pick<SandboxRunner, "defaultTab" | "tables">,
): "console" | "tables" {
  return runner.tables && runner.defaultTab === "tables" ? "tables" : "console";
}
