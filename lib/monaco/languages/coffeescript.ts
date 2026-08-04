import type { LanguageDefinition } from "../types";

export const CoffeescriptDefinition: LanguageDefinition = {
  id: "coffeescript",
  extensions: [".coffee"],
  aliases: ["CoffeeScript", "coffee", "coffeescript"],
  mimeTypes: ["text/coffeescript"],
  detectionPatterns: [
    { pattern: /^\s*\w+\s*=\s*(\([^)]*\)\s*)?->/m, weight: 3 },
    { pattern: /^\s*\w+\s*:\s*\([^)]*\)\s*->/m, weight: 3 },
    { pattern: /^\s*(unless|until)\s+/m, weight: 2 },
    { pattern: /\bconsole\.log\s+[^(\s]/, weight: 2 },
  ],
};
