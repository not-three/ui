import { DownloadDb } from '~/lib/download';

type Writable = Pick<FileSystemWritableFileStream, 'write' | 'seek' | 'close' | 'abort'>;
type Picker = (options: { suggestedName: string }) => Promise<{ createWritable: () => Promise<Writable> }>;
type ChunkDb = Pick<DownloadDb, 'write' | 'getFullBlob' | 'close'>;

export interface P2PSink {
  readonly bytesWritten: number;
  readonly needsSave: boolean;
  write(buf: ArrayBuffer, index: number): Promise<void>;
  finish(): Promise<void>;
  save(): void;
  abort(): Promise<void>;
}

export interface P2PSinkOptions {
  showSaveFilePicker?: Picker;
  openDb?: () => Promise<ChunkDb>;
  saveBlob?: (blob: Blob, name: string) => void;
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Open a single persistent destination; subsequent retries reuse it. */
export async function createP2PSink(name: string, size: number, chunkSize: number, opts: P2PSinkOptions = {}): Promise<P2PSink> {
  if (chunkSize <= 0) throw new Error('Invalid P2P chunk size');
  const picker = opts.showSaveFilePicker ?? (typeof window !== 'undefined' && typeof (window as Window & { showSaveFilePicker?: Picker }).showSaveFilePicker === 'function'
    ? (window as Window & { showSaveFilePicker: Picker }).showSaveFilePicker.bind(window)
    : undefined);
  const writer = picker ? await (await picker({ suggestedName: name })).createWritable() : null;
  const dbName = `p2p-download-${crypto.randomUUID()}`;
  const db = writer ? null : await (opts.openDb?.() ?? DownloadDb.open(dbName));
  // Firefox may keep Blob parts backed by IndexedDB after getFullBlob().
  // Deleting the database at finish invalidates the save before it can read.
  const cleanupDb = () => { if (!opts.openDb) DownloadDb.reset(dbName); };
  if (db && !opts.openDb) window.addEventListener('beforeunload', cleanupDb, { once: true });
  let written = 0;
  let closed = false;
  let completedBlob: Blob | null = null;
  return {
    get bytesWritten() { return written; },
    get needsSave() { return !!db; },
    async write(buf, index) {
      if (closed) throw new Error('P2P sink is closed');
      const offset = index * chunkSize;
      if (offset > size || offset + buf.byteLength > size) throw new Error('P2P chunk is outside file bounds');
      if (writer) {
        await writer.seek(offset);
        await writer.write(buf);
      } else await db!.write(index, buf);
      written = Math.max(written, offset + buf.byteLength);
    },
    async finish() {
      if (closed) return;
      if (written !== size) throw new Error(`P2P file is incomplete: ${written} of ${size} bytes`);
      closed = true;
      if (writer) await writer.close();
      else {
        completedBlob = await db!.getFullBlob();
        db!.close();
      }
    },
    save() {
      if (completedBlob) (opts.saveBlob ?? downloadBlob)(completedBlob, name);
    },
    async abort() {
      if (closed) return;
      closed = true;
      if (writer) await writer.abort();
      else {
        db!.close();
        if (!opts.openDb) {
          window.removeEventListener('beforeunload', cleanupDb);
          cleanupDb();
        }
      }
    },
  };
}
