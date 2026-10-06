import { spawn } from "node:child_process";
import { drawCheckout } from "./draw-path.mjs";
import { runnerPorts } from "./ports.mjs";

if (!drawCheckout) throw new Error("A draw checkout is required for draw browser tests");

const child = spawn("pnpm", ["exec", "vite", "--host", "127.0.0.1", "--port", String(runnerPorts.drawPort), "--strictPort"], {
  cwd: drawCheckout, stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
