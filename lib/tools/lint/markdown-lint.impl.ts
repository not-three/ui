import type { ToolReportItem, ToolRun } from '../types';
import { sourceText, valid } from './shared';

export const run: ToolRun = async (inputs) => {
  const MarkdownIt = (await import('markdown-it')).default;
  const source = sourceText(inputs);
  const tokens = new MarkdownIt().parse(source, {});
  const items: ToolReportItem[] = [];
  let previousHeading = 0;
  for (const token of tokens) {
    if (token.type === 'heading_open') {
      const level = Number(token.tag.slice(1));
      if (level > previousHeading + 1) items.push({ level: 'warning', message: `Heading level jumps from ${previousHeading} to ${level}`, position: { line: (token.map?.[0] ?? 0) + 1, column: 1 } });
      previousHeading = level;
    }
  }
  const lines = source.split('\n');
  for (const token of tokens) {
    if (token.type === 'fence' && token.map && !lines.slice(token.map[0] + 1, token.map[1]).some(line => {
      const marker = /^\s*(`{3,}|~{3,})\s*$/.exec(line)?.[1];
      return marker?.[0] === token.markup[0] && marker.length >= token.markup.length;
    })) {
      items.push({ level: 'warning', message: 'Unclosed code fence', position: { line: token.map[0] + 1, column: 1 } });
    }
  }
  return items.length ? { kind: 'report', items } : valid('No Markdown structure issues');
};
