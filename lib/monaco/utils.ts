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

export function detectLanguageFromContent(content: string): string {
  if (!content.trim()) return "plaintext";
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
