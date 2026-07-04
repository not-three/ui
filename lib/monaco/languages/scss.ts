import type { LanguageDefinition } from "../types";

export const ScssDefinition: LanguageDefinition = {
  id: "scss",
  extensions: [".scss"],
  aliases: ["SCSS", "scss"],
  mimeTypes: ["text/x-scss"],
  detectionPatterns: [
    { pattern: /\$[\w-]+\s*:\s*[^;]+;/, weight: 3 },
    { pattern: /@(mixin|include|extend|use|forward|each|if|else)\b/, weight: 3 },
    { pattern: /&[.:#[]/, weight: 2 },
    { pattern: /[.#][\w-]+\s*\{/, weight: 1 },
  ],
};
