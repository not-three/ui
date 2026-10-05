import type { ToolInput, ToolInputKind, ToolSource } from './types';

export const TEXT_FILE_LIMIT = 16 * 1024 * 1024;
export type SourceValue = { source: ToolSource; text?: string; file?: File; language?: string };

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
    if (spec.kind === 'bytes') return { kind: 'bytes', stream: abortable(value.file.stream(), signal), size: value.file.size, name: value.file.name, source: 'file' };
    if (value.file.size > TEXT_FILE_LIMIT) throw new Error('this tool needs text; file too large');
    const text = await new Response(abortable(value.file.stream(), signal)).text();
    return { kind: 'text', text, source: 'file', language: value.language };
  }
  const text = value.text ?? '';
  if (spec.kind === 'text') return { kind: 'text', text, source: value.source, language: value.language };
  const bytes = new TextEncoder().encode(text);
  return { kind: 'bytes', stream: abortable(new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }), signal), size: bytes.byteLength, source: value.source };
}
