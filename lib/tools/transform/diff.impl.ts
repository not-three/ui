import type { ToolRun } from '../types';
export const run: ToolRun = async (inputs, options) => {
  const left = inputs.left;
  const right = inputs.right;
  if (!left || left.kind !== 'text' || !right || right.kind !== 'text') throw new Error('Two text inputs are required');
  const normalize = (text: string) => options.ignoreWhitespace ? text.replace(/\s+/g, ' ').trim() : text;
  return { kind: 'diff', left: normalize(left.text), right: normalize(right.text), language: left.language || right.language };
};
