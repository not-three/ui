import { describe, expect, it, vi } from 'vitest';
import { createP2PSink, prepareP2PSink } from '~/lib/transfer/p2p-sink';

const bytes = (values: number[]) => new Uint8Array(values).buffer;

describe('P2P streaming sink', () => {
  it('prepares a file destination before metadata and attaches it without reopening', async () => {
    const writes: number[] = [];
    const writer = {
      seek: vi.fn(async (at: number) => { writes.push(at); }),
      write: vi.fn(async (_buf: ArrayBuffer) => {}),
      close: vi.fn(async () => {}),
      abort: vi.fn(async () => {}),
    };
    const picker = vi.fn(async (_options: { suggestedName: string }) => ({ createWritable: async () => writer }));
    const prepared = await prepareP2PSink('incoming.bin', { showSaveFilePicker: picker });
    expect(picker).toHaveBeenCalledOnce();
    const sink = prepared.attach('actual.bin', 3, 3);
    await sink.write(bytes([1, 2, 3]), 0);
    await sink.finish();
    expect(picker).toHaveBeenCalledOnce();
    expect(writes).toEqual([0]);
    expect(writer.close).toHaveBeenCalledOnce();
  });

  it('writes each chunk to File System Access and rewinds a resumed chunk', async () => {
    const writes: number[][] = [];
    let position = 0;
    const writer = {
      seek: vi.fn(async (at: number) => { position = at; }),
      write: vi.fn(async (buf: ArrayBuffer) => { writes.push([position, ...new Uint8Array(buf)]); position += buf.byteLength; }),
      close: vi.fn(async () => {}),
      abort: vi.fn(async () => {}),
    };
    const sink = await createP2PSink('file.bin', 6, 3, {
      showSaveFilePicker: async () => ({ createWritable: async () => writer }),
    });
    await sink.write(bytes([1, 2, 3]), 0);
    await sink.write(bytes([4, 5, 6]), 1);
    await sink.write(bytes([7, 8, 9]), 1);
    expect(sink.bytesWritten).toBe(6);
    expect(writes).toEqual([[0, 1, 2, 3], [3, 4, 5, 6], [3, 7, 8, 9]]);
    await sink.finish();
    expect(writer.close).toHaveBeenCalledOnce();
  });

  it('persists fallback chunks one by one without assembling before finish', async () => {
    const chunks = new Map<number, ArrayBuffer>();
    const db = {
      write: vi.fn(async (index: number, data: ArrayBuffer) => { chunks.set(index, data); }),
      getFullBlob: vi.fn(async () => new Blob([...chunks.values()])),
      close: vi.fn(),
    };
    const save = vi.fn();
    const sink = await createP2PSink('file.bin', 6, 3, { openDb: async () => db, saveBlob: save });
    await sink.write(bytes([1, 2, 3]), 0);
    await sink.write(bytes([4, 5, 6]), 1);
    expect(db.write).toHaveBeenCalledTimes(2);
    expect(db.getFullBlob).not.toHaveBeenCalled();
    expect(sink.bytesWritten).toBe(6);
    await sink.finish();
    expect(save).not.toHaveBeenCalled();
    expect(db.close).toHaveBeenCalledOnce();
    expect(sink.needsSave).toBe(true);
    sink.save();
    expect(save).toHaveBeenCalledOnce();
  });
});
