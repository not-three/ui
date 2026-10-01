import { languageDefinitions } from "./languages";

interface DetectionResult {
  languageId: string;
  score: number;
}

// Only score the first 64 KB — plenty of signal, keeps typing snappy on huge pastes.
const MAX_DETECTION_LENGTH = 64 * 1024;
// A single generic pattern must not be able to drown out everything else.
const MAX_MATCHES_PER_PATTERN = 10;

function withGlobalMultiline(pattern: RegExp): RegExp {
  let flags = pattern.flags;
  if (!flags.includes("g")) flags += "g";
  if (!flags.includes("m")) flags += "m";
  return new RegExp(pattern.source, flags);
}

/** Strong CSV signal: three consecutive data-shaped records with the same width. */
export function looksLikeCsv(content: string): boolean {
  const sample = content.slice(0, MAX_DETECTION_LENGTH).trimStart();
  if (sample.startsWith("{") || sample.startsWith("<") || sample.startsWith("[")) return false;
  const lines = sample.split(/\r?\n/).filter((line) => line.trim());
  for (const separator of [",", ";", "\t"]) {
    const fields = (line: string): string[] | null => {
      const values: string[] = [];
      let value = "";
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (quoted && line[i + 1] === '"') { value += '"'; i++; }
          else quoted = !quoted;
        } else if (char === separator && !quoted) {
          values.push(value.trim()); value = "";
        } else value += char;
      }
      values.push(value.trim());
      return quoted ? null : values;
    };
    for (let i = 0; i <= lines.length - 3; i++) {
      const window = lines.slice(i, i + 3).map(fields);
      if (window.some((row) => row === null)) continue;
      const [header, second, third] = window as [string[], string[], string[]];
      if (header.length < 3 || header.length !== second.length || header.length !== third.length) continue;
      // A sentence with two commas per line is still prose. Column headings
      // are short labels, and tabular records do not end in sentence marks.
      if (header.some((field) => !field || field.split(/\s+/).length > 2)) continue;
      if ([header, second, third].some((row) => row.some((field) => /[.!?]$/.test(field)))) continue;
      return true;
    }
  }
  return false;
}

export function detectLanguageFromContent(content: string): string {
  if (!content.trim()) return "plaintext";
  if (looksLikeCsv(content)) return "csv";
  const sample = content.slice(0, MAX_DETECTION_LENGTH);

  const results: DetectionResult[] = languageDefinitions
    .filter(
      (lang) => lang.detectionPatterns && lang.detectionPatterns.length > 0,
    )
    .map((lang) => {
      const score = lang.detectionPatterns!.reduce(
        (total, { pattern, weight = 1 }) => {
          const matches =
            sample.match(withGlobalMultiline(pattern))?.length ?? 0;
          return total + Math.min(matches, MAX_MATCHES_PER_PATTERN) * weight;
        },
        0,
      );
      return { languageId: lang.id, score };
    });

  results.sort((a, b) => b.score - a.score);
  return results.length > 0 && results[0].score > 0
    ? results[0].languageId
    : "plaintext";
}

// Debounce function for language detection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
