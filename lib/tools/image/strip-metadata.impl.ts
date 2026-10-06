import type { ToolRun } from '../types';
import { sniffFormat, getCodec } from '../../image/codecs';
import { blobFromRaster, pixelsOf } from '../../image/raster';
import { inspectImage } from '../../image/decode';
import { requireImage, stem } from './shared';
import { readExif, stripMetadata } from '../../image/metadata';
export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const format = sniffFormat(image.bytes);
  if (!format) throw new Error('Unsupported image format');
  context.signal.throwIfAborted();
  const orientation = readExif(image.bytes).orientation;
  if (options.keepOrientation !== false && orientation !== 1) {
    const codec = getCodec(format);
    if (!('data' in image.bitmap) && codec.encode && await codec.canEncode()) {
      const blob = await codec.encode(image.bitmap, { quality: 100, lossless: true }, context.signal);
      context.signal.throwIfAborted();
      return { kind: 'image', blob, width: image.width, height: image.height, filename: `${stem(image.name)}-strip-metadata.${codec.extensions[0]}` };
    }
    const blob = await blobFromRaster(await pixelsOf(image.bitmap));
    context.signal.throwIfAborted();
    return { kind: 'image', blob, width: image.width, height: image.height, filename: `${stem(image.name)}-strip-metadata.png` };
  }
  if (format === 'jpeg' || format === 'png' || format === 'webp') {
    const bytes = stripMetadata(image.bytes, format);
    const dimensions = inspectImage(bytes);
    return { kind: 'image', blob: new Blob([bytes as BlobPart], { type: image.mimeType }), width: dimensions.width || image.width, height: dimensions.height || image.height, filename: `${stem(image.name)}-strip-metadata.${getCodec(format).extensions[0]}` };
  }
  const blob = await blobFromRaster(await pixelsOf(image.bitmap));
  context.signal.throwIfAborted();
  return { kind: 'image', blob, width: image.width, height: image.height, filename: `${stem(image.name)}-strip-metadata.png` };
};
