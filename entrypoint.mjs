import { spawn } from "child_process";
import { writeFileSync } from "fs";

let proc = null;

["SIGTERM", "SIGINT"].forEach((signal) => {
  process.on(signal, () => {
    if (proc) proc.kill(signal);
    if (signal === "SIGTERM") process.exit(0);
  });
});

writeFileSync(
  "public/config.json",
  JSON.stringify({
    baseURL: process.env.API_URL || "/api/",
    drawURL: process.env.DRAW_URL || "/api/draw/",
    termsURL: process.env.TERMS_OF_SERVICE_URL,
  }),
);

proc = spawn("node", ["server/index.mjs"], { stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
