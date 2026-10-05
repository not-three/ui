import type { ToolInput, ToolReportItem } from '../types';

export function sourceText(inputs: Record<string, ToolInput>): string {
  const input = inputs.input;
  if (!input || input.kind !== 'text') throw new Error('Text input is required');
  return input.text;
}

export function valid(message: string): { kind: 'report'; items: ToolReportItem[] } {
  return { kind: 'report', items: [{ level: 'success', message }] };
}

export function invalid(message: string, line?: number, column?: number): { kind: 'report'; items: ToolReportItem[] } {
  return { kind: 'report', items: [{ level: 'error', message, ...(line && column ? { position: { line, column } } : {}) }] };
}
