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

export interface PreparedP2PSink {
  attach(name: string, size: number, chunkSize: number): P2PSink;
  abort(): Promise<void>;
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

/** Open the destination on the user's Connect gesture, before receiving any frames. */
export async function prepareP2PSink(suggestedName: string, opts: P2PSinkOptions = {}): Promise<PreparedP2PSink> {
  const picker = opts.showSaveFilePicker ?? (typeof window !== 'undefined' && typeof (window as Window & { showSaveFilePicker?: Picker }).showSaveFilePicker === 'function'
    ? (window as Window & { showSaveFilePicker: Picker }).showSaveFilePicker.bind(window)
    : undefined);
  const writer = picker ? await (await picker({ suggestedName })).createWritable() : null;
  const dbName = `p2p-download-${crypto.randomUUID()}`;
  const db = writer ? null : await (opts.openDb?.() ?? DownloadDb.open(dbName));
  // Firefox may keep Blob parts backed by IndexedDB after getFullBlob().
  // Deleting the database at finish invalidates the save before it can read.
  const cleanupDb = () => {
    if (!opts.openDb) {
      db?.close();
      DownloadDb.reset(dbName);
    }
  };
  if (db && !opts.openDb) window.addEventListener('beforeunload', cleanupDb, { once: true });
  let attached: P2PSink | null = null;
  let disposed = false;
  return {
    attach(name, size, chunkSize) {
      if (disposed || attached) throw new Error('P2P destination is already in use');
      if (chunkSize <= 0) throw new Error('Invalid P2P chunk size');
      let written = 0;
      let closed = false;
      let completedBlob: Blob | null = null;
      attached = {
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
          if (writer) {
            await writer.close();
            closed = true;
          } else {
            completedBlob = await db!.getFullBlob();
            db!.close();
            closed = true;
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
      return attached;
    },
    async abort() {
      if (disposed) return;
      disposed = true;
      if (attached) return attached.abort();
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

/** Open a destination and attach known metadata in one step. */
export async function createP2PSink(name: string, size: number, chunkSize: number, opts: P2PSinkOptions = {}): Promise<P2PSink> {
  if (chunkSize <= 0) throw new Error('Invalid P2P chunk size');
  return (await prepareP2PSink(name, opts)).attach(name, size, chunkSize);
}
