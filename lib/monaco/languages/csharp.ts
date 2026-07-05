import type { LanguageDefinition } from "../types";

export const CsharpDefinition: LanguageDefinition = {
  id: "csharp",
  extensions: [".cs"],
  aliases: ["C#", "csharp", "cs"],
  mimeTypes: ["text/x-csharp"],
  detectionPatterns: [
    { pattern: /\busing\s+System(\.\w+)*\s*;/, weight: 4 },
    { pattern: /\bnamespace\s+[\w.]+/, weight: 2 },
    { pattern: /\b(public|private|internal|protected)\s+(static\s+)?(class|void|int|string|async)\b/, weight: 2 },
    { pattern: /Console\.Write(Line)?\(/, weight: 3 },
    { pattern: /\bvar\s+\w+\s*=\s*new\s+\w+/, weight: 2 },
  ],
};
