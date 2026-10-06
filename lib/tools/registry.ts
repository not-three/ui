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
import { aes } from './crypto/aes';
import { caesar } from './crypto/caesar';
import { hmac } from './crypto/hmac';
import { jwt } from './crypto/jwt';
import { not3Payload } from './crypto/not3-payload';
import { rot13 } from './crypto/rot13';
import { keypair } from './generate/keypair';
import { password } from './generate/password';
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
import { convert } from './image/convert';
import { resize } from './image/resize';
import { rotate } from './image/rotate';
import { removeBackground } from './image/remove-background';

export const TOOLS: ToolDefinition[] = [
  cssLint, htmlLint, jsTsLint, jsonLint, markdownLint, sqlLint, xmlLint, yamlLint,
  hash, base64, hex, url,
  not3Payload, aes, caesar, hmac, jwt, rot13,
  letterCase, csvJson, diff, escapeText, jsonYaml, markdownHtml, minify, regex, sortLines, textStats, timestamp,
  cron, keypair, lorem, password, qr, uuid,
  convert, removeBackground, resize, rotate,
];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find(tool => tool.id === id);
}
