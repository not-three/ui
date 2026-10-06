import type { ToolRun } from '../types';
import { requireText } from './shared';

export const run: ToolRun = async (inputs) => {
  const source = requireText(inputs.input);
  const { default: MarkdownIt } = await import('markdown-it');
  return { kind: 'text', text: new MarkdownIt({ html: false, linkify: true }).render(source), language: 'html', filename: 'converted.html' };
};
