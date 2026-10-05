import type { ToolInput, ToolInputKind, ToolSource } from './types';

export const TEXT_FILE_LIMIT = 16 * 1024 * 1024;
export type SourceValue = { source: ToolSource; text?: string; file?: File; language?: string };

export async function resolveInput(spec: { kind: ToolInputKind }, value: SourceValue): Promise<ToolInput> {
  if (value.source === 'file') {
    if (!value.file) throw new Error('Choose a file');
    if (spec.kind === 'bytes') return { kind: 'bytes', stream: value.file.stream(), size: value.file.size, name: value.file.name, source: 'file' };
    if (value.file.size > TEXT_FILE_LIMIT) throw new Error('this tool needs text; file too large');
    const text = await new Response(value.file.stream()).text();
    return { kind: 'text', text, source: 'file', language: value.language };
  }
  const text = value.text ?? '';
  if (spec.kind === 'text') return { kind: 'text', text, source: value.source, language: value.language };
  const bytes = new TextEncoder().encode(text);
  return { kind: 'bytes', stream: new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }), size: bytes.byteLength, source: value.source };
}
