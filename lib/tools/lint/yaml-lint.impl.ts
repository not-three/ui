import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';

export const run: ToolRun = async (inputs) => {
  const { parseDocument } = await import('yaml');
  const document = parseDocument(sourceText(inputs), { uniqueKeys: true });
  if (!document.errors.length) return valid('Valid YAML');
  const error = document.errors[0]!;
  const offset = error.pos[0];
  const prefix = sourceText(inputs).slice(0, offset).split('\n');
  return invalid(error.message, prefix.length, prefix.at(-1)!.length + 1);
};
