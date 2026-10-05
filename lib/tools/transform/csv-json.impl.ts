import type { ToolRun } from '../types';
import { errorReport, jsonError, requireText } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const { default: Papa } = await import('papaparse');
  if (options.direction === 'json-csv') {
    let data: unknown;
    try { data = JSON.parse(source); } catch (error) { return { kind: 'report', items: [jsonError(error, source)] }; }
    if (!Array.isArray(data) || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
      return errorReport('Expected a JSON array of objects');
    }
    return { kind: 'text', text: Papa.unparse(data), language: 'csv', filename: 'converted.csv' };
  }
  const parsed = Papa.parse<Record<string, string>>(source, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) return { kind: 'report', items: parsed.errors.map(error => ({
    level: 'error' as const, message: error.message,
    position: { line: (error.row ?? 0) + 2, column: 1 },
  })) };
  return { kind: 'text', text: JSON.stringify(parsed.data, null, 2), language: 'json', filename: 'converted.json' };
};
