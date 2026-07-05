import type { LanguageDefinition } from "../types";

export const RDefinition: LanguageDefinition = {
  id: "r",
  extensions: [".r", ".R"],
  aliases: ["R", "r"],
  mimeTypes: ["text/x-r"],
  detectionPatterns: [
    { pattern: /\blibrary\(\w+\)/, weight: 4 },
    { pattern: /\w+\s*<-\s*/, weight: 3 },
    { pattern: /%>%/, weight: 3 },
    { pattern: /\b(data\.frame|ggplot|tibble)\s*\(/, weight: 3 },
  ],
};
