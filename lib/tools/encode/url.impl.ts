import type { ToolRun } from '../types';
export const run: ToolRun = async (inputs, options) => {
  const input = inputs.input;
  if (!input || input.kind !== 'text') throw new Error('Text input is required');
  const component = options.scope !== 'url';
  try {
    return { kind: 'text', text: options.mode === 'decode'
      ? component ? decodeURIComponent(input.text) : decodeURI(input.text)
      : component ? encodeURIComponent(input.text) : encodeURI(input.text), language: 'plaintext' };
  } catch { throw new Error('Invalid URL escape sequence'); }
};
