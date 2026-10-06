import type { ToolRun } from '../types';
import { requireText } from './shared';

function words(source: string): string[] {
  return source.replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const style = String(options.style ?? 'lower');
  if (style === 'upper') return { kind: 'text', text: source.toLocaleUpperCase() };
  if (style === 'lower') return { kind: 'text', text: source.toLocaleLowerCase() };
  const parts = words(source).map(word => word.toLocaleLowerCase());
  const capitalize = (word: string) => word[0]?.toLocaleUpperCase() + word.slice(1);
  const converted = style === 'title' ? parts.map(capitalize).join(' ')
    : style === 'camel' ? parts.map((word, index) => index ? capitalize(word) : word).join('')
      : style === 'snake' ? parts.join('_')
        : style === 'kebab' ? parts.join('-')
          : style === 'constant' ? parts.join('_').toLocaleUpperCase() : source;
  return { kind: 'text', text: converted };
};
