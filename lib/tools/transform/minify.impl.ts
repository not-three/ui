import type { ToolRun } from '../types';
import { jsonError, requireText } from './shared';

function minifyCss(source: string): string {
  let out = '';
  let space = false;
  for (let i = 0; i < source.length;) {
    const char = source[i]!;
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end < 0 ? source.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'") {
      if (space && out && !/[{(:,;>+~]$/.test(out)) out += ' ';
      space = false;
      const quote = char;
      out += char;
      i++;
      while (i < source.length) {
        const next = source[i++]!;
        out += next;
        if (next === '\\' && i < source.length) out += source[i++];
        else if (next === quote) break;
      }
      continue;
    }
    if (source.slice(i, i + 5).toLowerCase() === 'calc(') {
      if (space && out && !/[{(:,;>+~]$/.test(out)) out += ' ';
      space = false;
      let end = i + 5;
      let depth = 1;
      let quote = '';
      while (end < source.length && depth > 0) {
        const next = source[end++]!;
        if (next === '\\') { end++; continue; }
        if (quote) { if (next === quote) quote = ''; continue; }
        if (next === '"' || next === "'") quote = next;
        else if (next === '(') depth++;
        else if (next === ')') depth--;
      }
      out += source.slice(i, end);
      i = end;
      continue;
    }
    if (source.slice(i, i + 4).toLowerCase() === 'url(') {
      if (space && out && !/[{(:,;>+~]$/.test(out)) out += ' ';
      space = false;
      const end = source.indexOf(')', i + 4);
      out += source.slice(i, end < 0 ? source.length : end + 1);
      i = end < 0 ? source.length : end + 1;
      continue;
    }
    if (/\s/.test(char)) { space = true; i++; continue; }
    if (/[{}:;,>+~]/.test(char)) {
      out = out.trimEnd();
      if (char !== ';' || source.slice(i + 1).trimStart()[0] !== '}') out += char;
      space = false;
    } else {
      if (space && out && !/[{(:,;>+~]$/.test(out)) out += ' ';
      out += char;
      space = false;
    }
    i++;
  }
  return out.trim();
}

function minifyHtml(source: string): string {
  const protectedParts: string[] = [];
  const sentinel = (value: string) => {
    const index = protectedParts.push(value) - 1;
    return `\uE000${index}\uE001`;
  };
  const protectedSource = source.replace(/<(pre|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, sentinel);
  return protectedSource.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<\/(?:div|p|li|ul|ol|section|article|main|header|footer|table|tr|h[1-6])\s*>)\s+(?=<)/gi, '$1')
    .replace(/\uE000(\d+)\uE001/g, (_, index: string) => protectedParts[Number(index)]!);
}

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input);
  const format = String(options.format ?? 'json');
  if (format === 'css') return { kind: 'text', text: minifyCss(source), language: 'css', filename: 'minified.css' };
  if (format === 'html') return { kind: 'text', text: minifyHtml(source), language: 'html', filename: 'minified.html' };
  try {
    return { kind: 'text', text: JSON.stringify(JSON.parse(source)), language: 'json', filename: 'minified.json' };
  } catch (error) {
    return { kind: 'report', items: [jsonError(error, source)] };
  }
};
