import { describe, expect, it } from "vitest";
import {
  DownloadIncompleteError,
  runDownload,
} from "~/lib/transfer/download-runner";

function fakeDownload(chunks: ArrayBuffer[]) {
  return {
    start: async (setBytes: (buf: ArrayBuffer, index: number) => Promise<void>) => {
      for (const [index, buf] of chunks.entries()) await setBytes(buf, index);
    },
  };
}
const buf = (n: number) => new ArrayBuffer(n);

describe("runDownload", () => {
  it("writes all chunks and reports progress", async () => {
    const written: number[] = [];
    const db = { write: async (index: number) => { written.push(index); } };
    const seen: number[] = [];
    const count = await runDownload(fakeDownload([buf(5), buf(5), buf(2)]), db, 3, {
      onChunk: (i) => seen.push(i),
    });
    expect(count).toBe(3);
    expect(written).toEqual([0, 1, 2]);
    expect(seen).toEqual([0, 1, 2]);
  });

  it("throws DownloadIncompleteError when chunks are missing", async () => {
    const db = { write: async () => {} };
    await expect(runDownload(fakeDownload([buf(5)]), db, 3)).rejects.toBeInstanceOf(
      DownloadIncompleteError,
    );
  });

  it("propagates errors from the download", async () => {
    const db = { write: async () => {} };
    const failing = { start: async () => { throw new Error("network down"); } };
    await expect(runDownload(failing, db, 1)).rejects.toThrow("network down");
  });

  it("stops writing after cancellation without throwing", async () => {
    const written: number[] = [];
    const db = { write: async (index: number) => { written.push(index); } };
    let canceled = false;
    const count = await runDownload(fakeDownload([buf(1), buf(1), buf(1)]), db, 3, {
      onChunk: (i) => { if (i === 0) canceled = true; },
      isCanceled: () => canceled,
    });
    expect(count).toBe(1);
    expect(written).toEqual([0]);
  });
});
