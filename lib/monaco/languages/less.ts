import type { LanguageDefinition } from "../types";

export const LessDefinition: LanguageDefinition = {
  id: "less",
  extensions: [".less"],
  aliases: ["Less", "less"],
  mimeTypes: ["text/x-less"],
  detectionPatterns: [
    { pattern: /@[\w-]+\s*:\s*[^;]+;/, weight: 3 },
    { pattern: /&:extend\(/, weight: 4 },
    { pattern: /\.[\w-]+\s*\([^)]*\)\s*;/, weight: 2 },
    { pattern: /[.#][\w-]+\s*\{/, weight: 1 },
  ],
};
