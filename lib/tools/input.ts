import type { ToolInput, ToolInputKind, ToolSource } from './types';
import { checkImageLimits, decodeImage } from '../image/decode';

export const TEXT_FILE_LIMIT = 16 * 1024 * 1024;
export type SourceValue = { source: ToolSource; text?: string; file?: File; language?: string; region?: import('./types').ImageRegion; point?: import('./types').ImagePoint };

function textImageBytes(text: string): Uint8Array {
  const trimmed = text.trim();
  if (/^<\?xml/i.test(trimmed) || /^<svg(?:\s|>)/i.test(trimmed)) {
    return new TextEncoder().encode(trimmed);
  }
  const match = trimmed.match(/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i);
  if (!match) throw new Error('not an image');
  const payload = trimmed.slice(match[0].length);
  if (payload.length > 4 * 256 * 1024 * 1024 / 3 + 16) throw new Error('Image exceeds 256 MiB limit');
  try {
    if (/;base64,/i.test(match[0])) return Uint8Array.from(atob(payload.replace(/\s/g, '')), char => char.charCodeAt(0));
    return new TextEncoder().encode(decodeURIComponent(payload));
  } catch { throw new Error('not an image'); }
}

function abortable(stream: ReadableStream<Uint8Array>, signal?: AbortSignal): ReadableStream<Uint8Array> {
  if (!signal) return stream;
  const reader = stream.getReader();
  let output: ReadableStreamDefaultController<Uint8Array>;
  const abort = () => { void reader.cancel(); output.error(new DOMException('Aborted', 'AbortError')); };
  return new ReadableStream({
    start(controller) { output = controller; if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true }); },
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) { signal.removeEventListener('abort', abort); controller.close(); }
        else controller.enqueue(value);
      } catch (error) { controller.error(error); }
    },
    cancel(reason) { signal.removeEventListener('abort', abort); return reader.cancel(reason); },
  });
}

export async function resolveInput(spec: { kind: ToolInputKind }, value: SourceValue, signal?: AbortSignal): Promise<ToolInput> {
  if (value.source === 'file') {
    if (!value.file) throw new Error('Choose a file');
    if (spec.kind === 'image') {
      checkImageLimits(value.file.size, 0, 0);
      const image = await decodeImage(new Uint8Array(await value.file.arrayBuffer()), value.file.name, signal);
      return { ...image, source: value.source, region: value.region, point: value.point };
    }
    if (spec.kind === 'bytes') return { kind: 'bytes', stream: abortable(value.file.stream(), signal), size: value.file.size, name: value.file.name, source: 'file' };
    if (value.file.size > TEXT_FILE_LIMIT) throw new Error('this tool needs text; file too large');
    const text = await new Response(abortable(value.file.stream(), signal)).text();
    return { kind: 'text', text, source: 'file', language: value.language };
  }
  const text = value.text ?? '';
  if (spec.kind === 'image') {
    const image = await decodeImage(textImageBytes(text), undefined, signal);
    return { ...image, source: value.source, region: value.region, point: value.point };
  }
  if (spec.kind === 'text') return { kind: 'text', text, source: value.source, language: value.language };
  const bytes = new TextEncoder().encode(text);
  return { kind: 'bytes', stream: abortable(new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }), signal), size: bytes.byteLength, source: value.source };
}
