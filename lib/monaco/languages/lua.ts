import type { LanguageDefinition } from "../types";

export const LuaDefinition: LanguageDefinition = {
  id: "lua",
  extensions: [".lua"],
  aliases: ["Lua", "lua"],
  mimeTypes: ["text/x-lua"],
  detectionPatterns: [
    { pattern: /\blocal\s+\w+\s*=/, weight: 3 },
    { pattern: /\bfunction\s+\w+[.:]?\w*\s*\(/, weight: 2 },
    { pattern: /\b(elseif|then)\b/, weight: 2 },
    { pattern: /\bnil\b/, weight: 1 },
    { pattern: /\bpairs\s*\(|\bipairs\s*\(/, weight: 3 },
  ],
};
