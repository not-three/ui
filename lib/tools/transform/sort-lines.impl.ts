import type { ToolRun } from '../types';
import { requireText } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  if (!source) return { kind: 'text', text: '' };
  const trailing = source.endsWith('\n');
  const lines = source.split('\n');
  if (trailing) lines.pop();
  const values = options.unique ? [...new Set(lines)] : lines;
  const collator = new Intl.Collator(undefined, { numeric: options.numeric === true });
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => {
    const first = Number.parseFloat(a.value);
    const second = Number.parseFloat(b.value);
    const comparison = options.numeric && !Number.isNaN(first) && !Number.isNaN(second)
      ? first - second : collator.compare(a.value, b.value);
    return (options.reverse ? -comparison : comparison) || a.index - b.index;
  }).map(entry => entry.value);
  return { kind: 'text', text: sorted.join('\n') + (trailing ? '\n' : '') };
};
