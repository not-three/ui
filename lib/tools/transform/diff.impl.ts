import type { ToolRun } from '../types';
export const run: ToolRun = async (inputs, options) => {
  const left = inputs.left;
  const right = inputs.right;
  if (!left || left.kind !== 'text' || !right || right.kind !== 'text') throw new Error('Two text inputs are required');
  const normalized = options.ignoreWhitespace ? {
    displayLeft: left.text.replace(/\s+/g, ' ').trim(),
    displayRight: right.text.replace(/\s+/g, ' ').trim(),
  } : {};
  return { kind: 'diff', left: left.text, right: right.text, ...normalized, language: left.language || right.language };
};
