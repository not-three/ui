import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';

export const run: ToolRun = async (inputs) => {
  const [{ format }, postcss] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/postcss')]);
  try {
    await format(sourceText(inputs), { parser: 'css', plugins: [postcss] });
    return valid('Valid CSS syntax');
  } catch (error) {
    const e = error as Error & { loc?: { start?: { line: number; column: number } } };
    return invalid(e.message, e.loc?.start?.line, e.loc?.start?.column);
  }
};
