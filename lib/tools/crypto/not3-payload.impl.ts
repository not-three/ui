import { Crypto } from '@not3/sdk';
import type { ToolRun } from '../types';
import { requiredText } from './bytes';
export const run: ToolRun = async (inputs, _options, context) => {
  const payload = requiredText(inputs.input, 'Encrypted payload').trim();
  const seed = requiredText(inputs.seed, 'Fragment seed').trim();
  try {
    const key = await Crypto.generateKey(seed);
    const text = await Crypto.decrypt(payload, key);
    if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return { kind: 'text', text, language: 'plaintext' };
  } catch (error) {
    if (context.signal.aborted) throw error;
    throw new Error('Unable to decrypt payload: invalid seed or ciphertext', { cause: error });
  }
};
