import express from "express";
import path from "path";
import { buildConfig } from "./config.mjs";

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join("/app/public");

// Serve dynamic config.json
app.get("/config.json", (_, res) => {
  res.json(buildConfig(process.env));
});

// The note-runner "Run / Preview" panel executes note code inside an
// `<iframe sandbox="allow-scripts allow-modals">` with NO `allow-same-origin`,
// so the iframe has a permanently opaque origin ("null"). That makes it
// cross-origin to *everything*, including this very server — even though the
// interpreter assets under /vendor are served from our own origin. Classic
// `<script src>` tags still load in no-cors mode, but `fetch()` and dynamic
// `import()` (used by several runners to load .wasm/.mjs interpreter
// modules) are blocked by CORS unless the response carries an
// Access-Control-Allow-Origin header. These are public, credential-free
// interpreter binaries — exactly what a CDN would serve with `ACAO: *` — and
// no cookies or user data are reachable through /vendor, so a wildcard is
// safe here. Scoped to /vendor only; do not widen this to the whole app.
app.use("/vendor", (_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static files
app.use(express.static(publicDir));

// Fallback to index.html for SPA routing
app.get("*", (_, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`UI Server listening on port ${port}`);
});
