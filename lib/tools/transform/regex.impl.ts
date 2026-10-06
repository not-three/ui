import type { ToolRun, ToolReportItem } from '../types';
import { errorReport, requireText } from './shared';

const MAX_MATCHES = 1000;

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const pattern = String(options.pattern ?? '');
  const flags = String(options.flags ?? 'g');
  let expression: RegExp;
  try { expression = new RegExp(pattern, flags); } catch (error) { return errorReport(error instanceof Error ? error.message : String(error)); }
  const items: ToolReportItem[] = [];
  const matcher = expression;
  let scanned = 0;
  let line = 1;
  let column = 1;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(source))) {
    if (items.length >= MAX_MATCHES) {
      items.push({ level: 'warning', message: `Additional matches omitted after ${MAX_MATCHES}` });
      break;
    }
    for (; scanned < match.index; scanned++) {
      if (source[scanned] === '\n') { line++; column = 1; }
      else column++;
    }
    items.push({ level: 'info', message: match[0] ? `Match: ${match[0]}` : 'Zero-width match', position: { line, column } });
    if (!matcher.global) break;
    if (match[0].length === 0) matcher.lastIndex += (flags.includes('u') || flags.includes('v')) && (source.codePointAt(matcher.lastIndex) ?? 0) > 0xffff ? 2 : 1;
  }
  const report = { kind: 'report' as const, items: items.length ? items : [{ level: 'info' as const, message: 'No matches' }] };
  if (String(options.replacement ?? '') === '') return report;
  expression.lastIndex = 0;
  const right = source.replace(expression, String(options.replacement));
  return { kind: 'multi', parts: [
    { label: 'Matches', output: report },
    { label: 'Replacement preview', output: { kind: 'diff', left: source, right: right, language: inputs.input?.kind === 'text' ? inputs.input.language : undefined } },
  ] };
};
