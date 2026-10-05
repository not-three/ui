import type { ToolDefinition } from './types';
import { base64 } from './encode/base64';
import { hex } from './encode/hex';
import { url } from './encode/url';
import { jsonLint } from './lint/json-lint';
import { yamlLint } from './lint/yaml-lint';
import { xmlLint } from './lint/xml-lint';
import { cssLint } from './lint/css-lint';
import { htmlLint } from './lint/html-lint';
import { jsTsLint } from './lint/js-ts-lint';
import { sqlLint } from './lint/sql-lint';
import { markdownLint } from './lint/markdown-lint';
import { hash } from './hash/hash';
import { diff } from './transform/diff';
import { uuid } from './generate/uuid';
import { qr } from './generate/qr';
import { lorem } from './generate/lorem';
import { cron } from './generate/cron';

export const TOOLS: ToolDefinition[] = [cssLint, htmlLint, jsTsLint, jsonLint, markdownLint, sqlLint, xmlLint, yamlLint, hash, base64, hex, url, diff, cron, lorem, qr, uuid];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find(tool => tool.id === id);
}
