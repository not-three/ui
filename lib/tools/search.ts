import { TOOLS } from './registry';
import type { ToolDefinition } from './types';

function subsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const char of haystack) if (char === needle[index]) index++;
  return index === needle.length;
}

export function searchTools(query: string): ToolDefinition[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return TOOLS;
  return TOOLS.filter(tool => words.every(word => {
    const fields = [tool.title, tool.description, tool.category, ...tool.keywords].map(value => value.toLowerCase());
    return fields.some(field => field.includes(word)) || [tool.title, ...tool.keywords].some(field => subsequence(word, field.toLowerCase()));
  }));
}
