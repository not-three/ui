// Static server for the runner suite: serves public/ (the vendored
// interpreters) plus the harness page. Mirrors production's /vendor CORS
// header, which the opaque-origin sandbox iframe needs.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".data": "application/octet-stream",
  ".css": "text/css",
  ".whl": "application/octet-stream",
  ".zip": "application/zip",
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  const file = path === "harness.html"
    ? join(root, "tests", "runners", "harness.html")
    : join(root, "public", path);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
      // Same policy as entrypoint/index.mjs: the sandbox iframe's opaque
      // origin makes us cross-origin to it; without ACAO, fetch()/import()
      // of vendor assets fails — the exact bug class this suite exists for.
      "access-control-allow-origin": "*",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(8788, "127.0.0.1");
