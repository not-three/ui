import type { LanguageDefinition } from "../types";

export const JavascriptDefinition: LanguageDefinition = {
  id: "javascript",
  extensions: [".js", ".jsx", ".mjs", ".cjs"],
  aliases: ["JavaScript", "js", "javascript"],
  mimeTypes: ["application/javascript"],
  detectionPatterns: [
    { pattern: /^[\s\n]*(import|export)\s+.*from\s+['"]/, weight: 1 },
    { pattern: /^[\s\n]*const\s+\w+\s*=\s*require\(/, weight: 2 },
    // Raised from 1: a named function declaration is a solid signal on its
    // own now that lua's generic `function` pattern (lua.ts) no longer
    // matches brace-bodied, C-family declarations like this one.
    { pattern: /\bfunction\s*\*?\s*\w+\s*\(/, weight: 2 },
    { pattern: /\bclass\s+\w+(\s+extends\s+\w+)?/, weight: 1 },
    // The four patterns above matched almost nothing on ordinary
    // DOM/console JavaScript ("const el = document.querySelector(...);
    // el.className = 'x'; console.log(el);"), letting weak, coincidental
    // matches in unrelated languages (e.g. less's `.method();` pattern)
    // outscore JS and steal the note into the wrong runner. These add
    // signals that are characteristic of real-world JS/TS without being
    // strong enough individually to steal notes from languages that share a
    // token (e.g. Rust's `let`, PHP's `===`) — see runner-language-collisions
    // regression test.
    { pattern: /\bconsole\.(log|error|warn|info|debug)\s*\(/, weight: 2 },
    { pattern: /\b(document|window)\.\w+/, weight: 2 },
    { pattern: /\b(const|let)\s+\w+\s*[=;]/, weight: 1 },
    { pattern: /\([^()]*\)\s*=>|\b\w+\s*=>/, weight: 1 },
    { pattern: /`[^`]*\$\{[^}]*\}[^`]*`/, weight: 2 },
    { pattern: /===|!==/, weight: 1 },
  ],
};
