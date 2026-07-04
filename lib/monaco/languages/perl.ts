import type { LanguageDefinition } from "../types";

export const PerlDefinition: LanguageDefinition = {
  id: "perl",
  extensions: [".pl", ".pm"],
  aliases: ["Perl", "perl"],
  mimeTypes: ["text/x-perl"],
  detectionPatterns: [
    { pattern: /\bmy\s+[$@%]\w+/, weight: 4 },
    { pattern: /\buse\s+(strict|warnings)\b/, weight: 4 },
    { pattern: /=~\s*[ms]?\//, weight: 3 },
    { pattern: /\bsub\s+\w+\s*\{/, weight: 2 },
  ],
};
