import type { DownloadDb } from "~/lib/download";

export interface DownloadLike {
  start(
    setBytes: (buf: ArrayBuffer, index: number) => Promise<void>,
  ): Promise<void>;
}

export class DownloadIncompleteError extends Error {
  constructor(
    public readonly expected: number,
    public readonly received: number,
  ) {
    super(`Download incomplete: received ${received} of ${expected} chunks.`);
    this.name = "DownloadIncompleteError";
  }
}

/**
 * Drive an SDK FileDownload into the chunk store and verify every expected
 * chunk arrived. A silently truncated stream (e.g. dropped connection at a
 * chunk boundary) otherwise "succeeds" with a corrupt file.
 * @returns the number of chunks written
 */
export async function runDownload(
  download: DownloadLike,
  db: Pick<DownloadDb, "write">,
  expectedChunks: number,
  opts: {
    onChunk?: (index: number) => void;
    isCanceled?: () => boolean;
  } = {},
): Promise<number> {
  let written = 0;
  await download.start(async (buf, index) => {
    if (opts.isCanceled?.()) return;
    await db.write(index, buf);
    written++;
    opts.onChunk?.(index);
  });
  if (opts.isCanceled?.()) return written;
  if (written !== expectedChunks)
    throw new DownloadIncompleteError(expectedChunks, written);
  return written;
}
