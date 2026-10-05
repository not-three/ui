import type { ToolInput, ToolPosition, ToolReportItem } from '../types';

export function requireText(input: ToolInput | undefined): string {
  if (!input || input.kind !== 'text') throw new Error('Text input is required');
  return input.text;
}

export function offsetPosition(source: string, offset: number): ToolPosition {
  const lines = source.slice(0, offset).split('\n');
  return { line: lines.length, column: lines.at(-1)!.length + 1 };
}

export function jsonError(error: unknown, source: string): ToolReportItem {
  const message = error instanceof Error ? error.message : String(error);
  const lineColumn = /line (\d+) column (\d+)/i.exec(message);
  const offset = /position (\d+)/i.exec(message);
  const token = /Unexpected token '([^']+)'/i.exec(message);
  const position = lineColumn ? { line: Number(lineColumn[1]), column: Number(lineColumn[2]) }
    : offset ? offsetPosition(source, Number(offset[1]))
      : token ? offsetPosition(source, Math.max(0, source.indexOf(token[1]!))) : undefined;
  return { level: 'error', message, ...(position && { position }) };
}

export function errorReport(message: string, position?: ToolPosition) {
  return { kind: 'report' as const, items: [{ level: 'error' as const, message, ...(position && { position }) }] };
}
