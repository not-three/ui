import type { ToolInput } from './types';

export function textInput(text: string, language?: string): ToolInput {
  return { kind: 'text', text, language };
}

export function bytesInput(bytes: Uint8Array | string): ToolInput {
  const data = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  return { kind: 'bytes', size: data.byteLength, stream: new ReadableStream({ start(controller) { controller.enqueue(data); controller.close(); } }) };
}

export function chunksInput(chunks: Uint8Array[]): ToolInput {
  return { kind: 'bytes', size: chunks.reduce((total, chunk) => total + chunk.byteLength, 0), stream: new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(chunk); controller.close(); } }) };
}
