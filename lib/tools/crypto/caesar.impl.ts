import type { ToolRun } from '../types';
import { requiredText } from './bytes';
export const run: ToolRun = async (inputs, options) => {
  const shift = Number(options.shift ?? 3);
  if (!Number.isInteger(shift) || shift < -25 || shift > 25) throw new Error('Shift must be an integer from -25 to 25');
  const text = requiredText(inputs.input, 'Input').replace(/[A-Za-z]/g, character => {
    const code = character.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(base + ((code - base + shift + 26) % 26));
  });
  return { kind: 'text', text, language: 'plaintext' };
};
