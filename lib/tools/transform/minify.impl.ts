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
    const functionMatch = /^[a-z_-][\w-]*\(/i.exec(source.slice(i));
    if (functionMatch) {
      if (space && out && !/[{(:,;>+~]$/.test(out)) out += ' ';
      space = false;
      let end = i + functionMatch[0].length;
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
    if (/\s/.test(char)) { space = true; i++; continue; }
    if (/[{};,>+~]/.test(char)) {
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
  const rawTags = new Set(['pre', 'script', 'style', 'textarea', 'title', 'xmp']);
  const tagOpener = /<\/?[a-z][\w:-]*(?=[\s/>])/iy;
  const lower = source.toLowerCase();
  let out = '';
  let i = 0;
  while (i < source.length) {
    if (source[i] !== '<') { out += source[i++]; continue; }
    if (source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i + 4);
      if (source.startsWith('<!--[', i)) out += source.slice(i, end < 0 ? source.length : end + 3);
      i = end < 0 ? source.length : end + 3;
      continue;
    }
    tagOpener.lastIndex = i;
    if (!tagOpener.test(source)) { out += source[i++]; continue; }
    let end = i + 1;
    let quote = '';
    while (end < source.length) {
      const char = source[end++];
      if (quote) { if (char === quote) quote = ''; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '>') break;
    }
    const tag = source.slice(i, end);
    if (!tag.endsWith('>')) { out += tag; break; }
    const name = /^<([a-z][\w:-]*)\b/i.exec(tag)?.[1]?.toLowerCase();
    if (name && rawTags.has(name) && tag.endsWith('>') && !tag.endsWith('/>')) {
      let close = lower.indexOf(`</${name}`, end);
      while (close >= 0 && !/[\s>]/.test(lower[close + name.length + 2] ?? '')) close = lower.indexOf(`</${name}`, close + 2);
      if (close >= 0) {
        const closeEnd = source.indexOf('>', close);
        if (closeEnd >= 0) {
          out += source.slice(i, closeEnd + 1);
          i = closeEnd + 1;
          continue;
        }
      }
    }
    let compact = '';
    quote = '';
    for (let j = 0; j < tag.length;) {
      const char = tag[j]!;
      if (quote) { compact += char; if (char === quote) quote = ''; j++; continue; }
      if (char === '"' || char === "'") { quote = char; compact += char; j++; continue; }
      if (/\s/.test(char)) {
        while (j < tag.length && /\s/.test(tag[j]!)) j++;
        const previous = compact.at(-1);
        const next = tag[j];
        if (previous && previous !== '<' && previous !== '=' && next !== '>' && next !== '=') compact += ' ';
        continue;
      }
      compact += char;
      j++;
    }
    out += compact;
    i = end;
  }
  return out;
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
