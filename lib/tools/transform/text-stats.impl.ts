import type { ToolRun } from '../types';
import { requireText } from './shared';

export const run: ToolRun = async (inputs) => {
  const source = requireText(inputs.input);
  const words = source.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { kind: 'table', columns: ['Metric', 'Value'], rows: [
    ['Characters', [...source].length],
    ['Words', words],
    ['Lines', source ? source.split('\n').length : 0],
    ['UTF-8 bytes', new TextEncoder().encode(source).byteLength],
    ['Reading time (minutes)', Math.round(words / 200 * 100) / 100],
  ] };
};
