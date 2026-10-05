import type { ToolRun, ToolPosition } from '../types';

function errorPosition(error: unknown, source: string): ToolPosition {
  const message = error instanceof Error ? error.message : String(error);
  const match = /position (\d+)/i.exec(message);
  const lineMatch = /line (\d+) column (\d+)/i.exec(message);
  if (lineMatch) return { line: Number(lineMatch[1]), column: Number(lineMatch[2]) };
  const prefix = source.slice(0, match ? Number(match[1]) : source.length);
  const lines = prefix.split('\n');
  return { line: lines.length, column: lines.at(-1)!.length + 1 };
}

export const run: ToolRun = async (inputs) => {
  const input = inputs.input;
  if (!input || input.kind !== 'text') throw new Error('Text input is required');
  try {
    JSON.parse(input.text);
    return { kind: 'report', items: [{ level: 'success', message: 'Valid JSON' }] };
  } catch (error) {
    return { kind: 'report', items: [{ level: 'error', message: error instanceof Error ? error.message : String(error), position: errorPosition(error, input.text) }] };
  }
};
