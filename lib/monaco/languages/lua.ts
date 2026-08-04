import type { LanguageDefinition } from "../types";

export const LuaDefinition: LanguageDefinition = {
  id: "lua",
  extensions: [".lua"],
  aliases: ["Lua", "lua"],
  mimeTypes: ["text/x-lua"],
  detectionPatterns: [
    { pattern: /\blocal\s+\w+\s*=/, weight: 3 },
    // A bare `\bfunction\s+\w+...\(` also matches JavaScript's
    // `function greet(name) {` — brace-bodied, C-family declarations — and
    // used to outscore JS's own (weaker) function pattern, silently routing
    // plain JS notes into the Lua VM. Lua function headers are never
    // brace-terminated (blocks are closed by a matching `end` keyword
    // instead), so anchor on the header's line ending with nothing but the
    // closing paren and optional trailing whitespace. Note:
    // detectLanguageFromContent always evaluates patterns with the "m" flag
    // (see withGlobalMultiline in lib/monaco/utils.ts), so `$` anchors to
    // end-of-line here, not end-of-string. This does not cover
    // Allman-brace-style JS (`function f()\n{`), which is rare in practice
    // and out of scope for the collisions this fix targets.
    { pattern: /\bfunction\s+\w+[.:]?\w*\s*\([^)]*\)\s*$/, weight: 2 },
    { pattern: /\b(elseif|then)\b/, weight: 2 },
    { pattern: /\bnil\b/, weight: 1 },
    { pattern: /\bpairs\s*\(|\bipairs\s*\(/, weight: 3 },
  ],
};
