import type { ToolRun } from '../types';
import { jsonError, requireText } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const yaml = await import('yaml');
  if (options.direction === 'yaml-json') {
    const doc = yaml.parseDocument(source, { uniqueKeys: true });
    if (doc.errors.length) return { kind: 'report', items: doc.errors.map(error => ({
      level: 'error' as const, message: error.message,
      ...(error.linePos?.[0] && { position: { line: error.linePos[0].line, column: error.linePos[0].col } }),
    })) };
    return { kind: 'text', text: JSON.stringify(doc.toJS(), null, 2), language: 'json', filename: 'converted.json' };
  }
  try {
    return { kind: 'text', text: yaml.stringify(JSON.parse(source)), language: 'yaml', filename: 'converted.yaml' };
  } catch (error) {
    return { kind: 'report', items: [jsonError(error, source)] };
  }
};
