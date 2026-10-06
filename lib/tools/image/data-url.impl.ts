import type { ToolRun } from '../types';
import { requireImage, stem } from './shared';
import { sniffFormat, getCodec } from '../../image/codecs';
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  context.signal.throwIfAborted();
  if (options.direction === 'decode') {
    const format = sniffFormat(image.bytes);
    if (!format) throw new Error('Not an image data URL');
    return { kind: 'image', blob: new Blob([image.bytes as BlobPart], { type: image.mimeType }), width: image.width, height: image.height, filename: `${stem(image.name)}-data-url.${getCodec(format).extensions[0]}` };
  }
  let binary = '';
  for (let p = 0; p < image.bytes.length; p += 8192) {
    context.signal.throwIfAborted();
    binary += String.fromCharCode(...image.bytes.subarray(p, p + 8192));
  }
  return { kind: 'text', text: `data:${image.mimeType};base64,${btoa(binary)}`, language: 'plaintext', filename: `${stem(image.name)}-data-url.txt` };
};
