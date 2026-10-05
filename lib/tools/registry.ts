import type { ToolDefinition } from './types';
import { base64 } from './encode/base64';
import { hex } from './encode/hex';
import { url } from './encode/url';
import { jsonLint } from './lint/json-lint';
import { hash } from './hash/hash';
import { diff } from './transform/diff';

export const TOOLS: ToolDefinition[] = [jsonLint, hash, base64, hex, url, diff];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find(tool => tool.id === id);
}
