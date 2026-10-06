import type { ToolRun } from '../types';
import { requireText } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const format = options.format;
  if (format === 'json') return { kind: 'text', text: JSON.stringify(source), language: 'json' };
  if (format === 'js') {
    const escaped = source.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return { kind: 'text', text: "'" + escaped + "'", language: 'javascript' };
  }
  if (format === 'shell') return { kind: 'text', text: "'" + source.replace(/'/g, "'\\''") + "'", language: 'shell' };
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": format === 'xml' ? '&apos;' : '&#39;' };
  return { kind: 'text', text: source.replace(/[&<>"']/g, char => entities[char]!), language: format === 'xml' ? 'xml' : 'html' };
};
