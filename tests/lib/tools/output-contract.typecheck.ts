import type { ToolOutput } from '../../../lib/tools/types';

const nested: ToolOutput = {
  kind: 'multi',
  parts: [{
    label: 'nested',
    output: {
      // @ts-expect-error multi parts must contain a single output
      kind: 'multi',
      parts: [],
    },
  }],
};

void nested;
