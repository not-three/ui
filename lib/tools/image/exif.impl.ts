import type { ToolRun, ToolSingleOutput } from '../types';
import { readExif } from '../../image/metadata';
export const run: ToolRun = async (inputs, _options, context) => {
  const image = inputs.input;
  if (!image || image.kind !== 'image') throw new Error('Image required');
  context.signal.throwIfAborted();
  const metadata = readExif(image.bytes);
  const entries = Object.entries(metadata.tags).filter(([key]) => key !== 'GPS');
  const parts: { label: string; output: ToolSingleOutput }[] = [
    { label: 'Tags', output: { kind: 'table', columns: ['Tag', 'Value'], rows: [
      ['Dimensions', `${image.width} × ${image.height} px`],
      ...entries.map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : typeof value === 'number' ? value : String(value)]),
    ] } },
  ];
  if (metadata.gps) parts.push({ label: 'Location', output: { kind: 'table', columns: ['Latitude', 'Longitude', 'Warning'], rows: [[metadata.gps.latitude, metadata.gps.longitude, 'This image contains location coordinates.']] } });
  parts.push({ label: 'Raw tags', output: { kind: 'text', text: JSON.stringify(metadata.tags, null, 2), language: 'json', filename: 'exif.json' } });
  return { kind: 'multi', parts };
};
