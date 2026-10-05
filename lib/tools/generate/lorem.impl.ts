import type { ToolRun } from '../types';

const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');

export const run: ToolRun = async (_inputs, options) => {
  const count = Number(options.count ?? 50);
  if (!Number.isInteger(count) || count < 1 || count > 1000) throw new Error('Count must be between 1 and 1000');
  if (options.mode === 'paragraphs') {
    const paragraphs = Array.from({ length: count }, (_, paragraph) => {
      const body = Array.from({ length: 40 }, (_, index) => words[(index + paragraph * 7) % words.length]).join(' ');
      return body[0]!.toUpperCase() + body.slice(1) + '.';
    });
    return { kind: 'text', text: paragraphs.join('\n\n') };
  }
  return { kind: 'text', text: Array.from({ length: count }, (_, index) => words[index % words.length]).join(' ') };
};
