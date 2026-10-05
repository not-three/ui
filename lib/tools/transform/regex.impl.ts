import type { ToolRun, ToolReportItem } from '../types';
import { errorReport, offsetPosition, requireText } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const pattern = String(options.pattern ?? '');
  const flags = String(options.flags ?? 'g');
  let expression: RegExp;
  try { expression = new RegExp(pattern, flags); } catch (error) { return errorReport(error instanceof Error ? error.message : String(error)); }
  const items: ToolReportItem[] = [];
  const matcher = new RegExp(expression.source, expression.flags.includes('g') ? expression.flags : expression.flags + 'g');
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(source))) {
    items.push({ level: 'info', message: match[0] ? `Match: ${match[0]}` : 'Zero-width match', position: offsetPosition(source, match.index) });
    if (match[0].length === 0) matcher.lastIndex += expression.unicode ? [...source.slice(matcher.lastIndex)][0]?.length ?? 1 : 1;
  }
  const report = { kind: 'report' as const, items: items.length ? items : [{ level: 'info' as const, message: 'No matches' }] };
  if (String(options.replacement ?? '') === '') return report;
  const right = source.replace(expression, String(options.replacement));
  return { kind: 'multi', parts: [
    { label: 'Matches', output: report },
    { label: 'Replacement preview', output: { kind: 'diff', left: source, right: right, language: inputs.input?.kind === 'text' ? inputs.input.language : undefined } },
  ] };
};
