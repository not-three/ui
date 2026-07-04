import type { LanguageDefinition } from "../types";

export const KotlinDefinition: LanguageDefinition = {
  id: "kotlin",
  extensions: [".kt", ".kts"],
  aliases: ["Kotlin", "kotlin", "kt"],
  mimeTypes: ["text/x-kotlin"],
  detectionPatterns: [
    { pattern: /\bfun\s+\w+\s*\(/, weight: 3 },
    { pattern: /\bdata\s+class\s+\w+/, weight: 4 },
    { pattern: /\bcompanion\s+object\b/, weight: 4 },
    { pattern: /\b(val|var)\s+\w+\s*:\s*\w+/, weight: 2 },
    { pattern: /\bwhen\s*\(/, weight: 2 },
  ],
};
