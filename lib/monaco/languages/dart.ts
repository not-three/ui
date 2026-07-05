import type { LanguageDefinition } from "../types";

export const DartDefinition: LanguageDefinition = {
  id: "dart",
  extensions: [".dart"],
  aliases: ["Dart", "dart"],
  mimeTypes: ["application/dart"],
  detectionPatterns: [
    { pattern: /\bimport\s+'package:/, weight: 4 },
    { pattern: /\bvoid\s+main\s*\(\s*\)/, weight: 2 },
    { pattern: /\bWidget\s+build\s*\(/, weight: 4 },
    { pattern: /\bfinal\s+\w+(<[^>]+>)?\s+\w+\s*=/, weight: 2 },
    { pattern: /\b(StatelessWidget|StatefulWidget|BuildContext)\b/, weight: 4 },
  ],
};
