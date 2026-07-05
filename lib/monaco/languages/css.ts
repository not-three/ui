import type { LanguageDefinition } from "../types";

export const CssDefinition: LanguageDefinition = {
  id: "css",
  extensions: [".css"],
  aliases: ["CSS", "css"],
  mimeTypes: ["text/css"],
  detectionPatterns: [
    { pattern: /[.#][\w-]+\s*\{/, weight: 2 },
    { pattern: /^\s*[\w-]+\s*:\s*[^;{}]+;\s*$/, weight: 1 },
    { pattern: /@(media|import|keyframes|font-face|charset)\b/, weight: 3 },
    { pattern: /:(hover|focus|active|first-child|nth-child|last-child)\b/, weight: 2 },
    { pattern: /!important\b/, weight: 2 },
  ],
};
