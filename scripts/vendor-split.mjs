// Cloudflare Pages refuses files above 25 MiB. A few vendored binaries
// (ruby.wasm, the background model, onnxruntime's wasm) are bigger, so the
// vendor step splits every such file into numbered parts plus a small JSON
// manifest, and the browser reassembles them (lib/vendor/parts.ts). The split
// is a plain byte cut: concatenating the parts in order yields the original.
import { openSync, closeSync, readSync, readdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

/** Files at or above this size are split. Leaves headroom under the 25 MiB Pages limit. */
export const PART_LIMIT = 20 * 1024 * 1024;
export const MANIFEST_SUFFIX = ".parts.json";

/** Split one file in place into `<name>.partN` files and `<name>.parts.json`, removing the original. */
export function splitFile(path, limit = PART_LIMIT) {
  const size = statSync(path).size;
  if (size <= limit) return null;
  const fd = openSync(path, "r");
  const parts = [];
  try {
    const buffer = Buffer.alloc(limit);
    let offset = 0;
    let index = 0;
    while (offset < size) {
      const length = Math.min(limit, size - offset);
      const read = readSync(fd, buffer, 0, length, offset);
      if (read !== length) throw new Error(`short read while splitting ${path}`);
      const name = `${path.split("/").pop()}.part${index}`;
      writeFileSync(join(path, "..", name), buffer.subarray(0, length));
      parts.push({ name, size: length });
      offset += length;
      index++;
    }
  } finally {
    closeSync(fd);
  }
  const manifest = { size, parts };
  writeFileSync(path + MANIFEST_SUFFIX, JSON.stringify(manifest));
  rmSync(path);
  return manifest;
}

/** Walk a directory tree and split every oversized file. Returns the manifests written. */
export function splitLargeFiles(dir, limit = PART_LIMIT) {
  const written = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) written.push(...splitLargeFiles(full, limit));
    else if (!/\.part\d+$/.test(entry.name) && !entry.name.endsWith(MANIFEST_SUFFIX)) {
      const manifest = splitFile(full, limit);
      if (manifest) written.push({ path: full, ...manifest });
    }
  }
  return written;
}
