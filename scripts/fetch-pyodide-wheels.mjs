// Downloads a small, pinned set of Pyodide wheels into public/vendor/pyodide
// so `import numpy` works with NO runtime network access. This is a
// BUILD-time fetch (like pnpm install) — the app itself never calls out.
// Every wheel is verified against the sha256 in the vendored pyodide-lock.json.
// Soft-fails: a network-less build still yields working stdlib-only Python.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PYODIDE_VERSION = "0.26.4";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;
const WANTED = ["numpy", "micropip", "packaging"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "vendor", "pyodide");
const lockPath = join(dir, "pyodide-lock.json");

if (!existsSync(lockPath)) {
  console.warn("[wheels] public/vendor/pyodide/pyodide-lock.json missing — run copy-sandbox-vendor first");
  process.exit(0);
}
const lock = JSON.parse(readFileSync(lockPath, "utf8"));

// Wheels have dependencies; pull those in too so imports resolve offline.
const queue = [...WANTED];
const selected = new Map();
while (queue.length) {
  const name = queue.shift();
  if (selected.has(name)) continue;
  const pkg = lock.packages?.[name];
  if (!pkg) {
    console.warn(`[wheels] ${name} not in pyodide-lock.json — skipped`);
    continue;
  }
  selected.set(name, pkg);
  for (const dep of pkg.depends ?? []) queue.push(dep);
}

let ok = 0;
for (const [name, pkg] of selected) {
  const dest = join(dir, pkg.file_name);
  if (existsSync(dest)) { ok++; continue; }
  try {
    const res = await fetch(`${BASE}/${pkg.file_name}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const sha = createHash("sha256").update(buf).digest("hex");
    if (pkg.sha256 && sha !== pkg.sha256) {
      throw new Error(`sha256 mismatch (expected ${pkg.sha256}, got ${sha})`);
    }
    writeFileSync(dest, buf);
    ok++;
  } catch (e) {
    console.warn(`[wheels] ${name}: ${e.message} — Python will run stdlib-only for it`);
  }
}
console.log(`[wheels] ${ok}/${selected.size} pyodide wheels vendored`);
