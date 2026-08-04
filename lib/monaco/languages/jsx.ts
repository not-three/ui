import type { LanguageDefinition } from "../types";

export const JsxDefinition: LanguageDefinition = {
  id: "jsx",
  extensions: [".jsx"],
  aliases: ["React (JSX)", "jsx", "react"],
  mimeTypes: ["text/jsx"],
  detectionPatterns: [
    { pattern: /<[A-Z][A-Za-z0-9]*(\s[^>]*)?\/?>/, weight: 2 },
    { pattern: /\buse(State|Effect|Ref|Memo|Callback)\s*\(/, weight: 3 },
    { pattern: /\bReactDOM\b|\bfrom\s+["']react["']/, weight: 3 },
    { pattern: /className=/, weight: 2 },
  ],
};
