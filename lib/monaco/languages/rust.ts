import type { LanguageDefinition } from "../types";

export const RustDefinition: LanguageDefinition = {
  id: "rust",
  extensions: [".rs"],
  aliases: ["Rust", "rust"],
  mimeTypes: ["text/x-rust"],
  detectionPatterns: [
    { pattern: /\bfn\s+\w+\s*(<[^>]*>)?\s*\(/, weight: 2 },
    { pattern: /\blet\s+mut\s+\w+/, weight: 3 },
    { pattern: /\buse\s+\w+(::\w+)+/, weight: 3 },
    { pattern: /\b(impl|trait|struct|enum)\s+\w+/, weight: 2 },
    { pattern: /\b(println|panic|vec|format)!\s*\(/, weight: 3 },
    { pattern: /->\s*&?\w+/, weight: 1 },
  ],
};
