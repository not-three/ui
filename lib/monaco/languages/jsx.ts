import type { LanguageDefinition } from "../types";

export const JsxDefinition: LanguageDefinition = {
  id: "jsx",
  extensions: [".jsx"],
  aliases: ["React (JSX)", "jsx", "react"],
  mimeTypes: ["text/jsx"],
  detectionPatterns: [
    // Requires an attribute or a self-close on the capitalized tag, not just
    // "<Word>" — a bare capitalized placeholder (mail-merge letters:
    // "Dear <Name>, your order <OrderNumber> shipped") has neither and no
    // longer matches.
    { pattern: /<[A-Z][A-Za-z0-9]*(\s+[a-zA-Z-]+\s*=|\s*\/>)/, weight: 2 },
    { pattern: /\buse(State|Effect|Ref|Memo|Callback)\s*\(/, weight: 3 },
    { pattern: /\bReactDOM\b|\bfrom\s+["']react["']/, weight: 3 },
    // Excludes `el.className = "x"` (plain DOM JS property assignment,
    // preceded by "."): only a bare `className=` — as it appears inside a
    // JSX tag — counts, and only when followed by a quote or `{` (a JSX
    // attribute value), not e.g. an inequality expression.
    { pattern: /(?<!\.)\bclassName=["'{]/, weight: 1 },
  ],
};
