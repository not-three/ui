import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';

export const run: ToolRun = async (inputs) => {
  const [{ format }, html, estree, babel, typescript, postcss] = await Promise.all([
    import('prettier/standalone'), import('prettier/plugins/html'), import('prettier/plugins/estree'),
    import('prettier/plugins/babel'), import('prettier/plugins/typescript'), import('prettier/plugins/postcss'),
  ]);
  try {
    await format(sourceText(inputs), { parser: 'html', plugins: [html, estree, babel, typescript, postcss] });
    return valid('Valid HTML syntax');
  } catch (error) {
    const e = error as Error & { loc?: { start?: { line: number; column: number } } };
    return invalid(e.message, e.loc?.start?.line, e.loc?.start?.column);
  }
};
