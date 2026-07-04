import type { LanguageDefinition } from "../types";

export const RubyDefinition: LanguageDefinition = {
  id: "ruby",
  extensions: [".rb", ".erb"],
  aliases: ["Ruby", "ruby", "rb"],
  mimeTypes: ["text/x-ruby"],
  detectionPatterns: [
    { pattern: /^\s*def\s+\w+/, weight: 2 },
    { pattern: /^\s*end\s*$/, weight: 2 },
    { pattern: /\brequire(_relative)?\s+['"]/, weight: 3 },
    { pattern: /\bputs\s+/, weight: 2 },
    { pattern: /\bdo\s*\|[\w\s,]+\|/, weight: 3 },
    { pattern: /\battr_(accessor|reader|writer)\b/, weight: 4 },
  ],
};
