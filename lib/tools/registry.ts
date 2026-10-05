import type { ToolDefinition } from './types';
import { base64 } from './encode/base64';
import { hex } from './encode/hex';
import { url } from './encode/url';
import { jsonLint } from './lint/json-lint';
import { hash } from './hash/hash';
import { diff } from './transform/diff';
import { jsonYaml } from './transform/json-yaml';
import { csvJson } from './transform/csv-json';
import { minify } from './transform/minify';
import { sortLines } from './transform/sort-lines';
import { letterCase } from './transform/case';
import { escapeText } from './transform/escape';
import { regex } from './transform/regex';
import { markdownHtml } from './transform/markdown-html';
import { textStats } from './transform/text-stats';
import { timestamp } from './transform/timestamp';

export const TOOLS: ToolDefinition[] = [jsonLint, hash, base64, hex, url, letterCase, csvJson, diff, escapeText, jsonYaml, markdownHtml, minify, regex, sortLines, textStats, timestamp];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find(tool => tool.id === id);
}
