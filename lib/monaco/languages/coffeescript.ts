import type { LanguageDefinition } from "../types";

export const CoffeescriptDefinition: LanguageDefinition = {
  id: "coffeescript",
  extensions: [".coffee"],
  aliases: ["CoffeeScript", "coffee", "coffeescript"],
  mimeTypes: ["text/coffeescript"],
  detectionPatterns: [
    { pattern: /^\s*\w+\s*=\s*(\([^)]*\)\s*)?->/m, weight: 3 },
    // Fat (bound) arrow assignment — CoffeeScript-only; Ruby has no
    // anonymous-function fat-arrow syntax (its "=>" is only the old
    // hash-rocket separator, never used to assign a callable).
    { pattern: /^\s*\w+\s*=\s*(\([^)]*\)\s*)?=>/m, weight: 3 },
    { pattern: /^\s*\w+\s*:\s*\([^)]*\)\s*->/m, weight: 3 },
    { pattern: /\bconsole\.log\s+[^(\s]/, weight: 2 },
    // "for key, val of obj" object-comprehension iteration is CoffeeScript-
    // specific ("of" for objects; Ruby's for-loop always uses "in", never
    // "of", and JS's for-of requires parens, which this deliberately omits).
    // Replaces the previous `unless|until` pattern, which is common,
    // ordinary Ruby control flow too and only "worked" here by accident of
    // registration order (Ruby's definition happens to be registered first,
    // so a stable sort broke real ties in Ruby's favour) rather than any
    // real distinguishing signal.
    { pattern: /\bfor\s+(own\s+)?\w+(\s*,\s*\w+)?\s+of\s+\w+/, weight: 3 },
  ],
};
