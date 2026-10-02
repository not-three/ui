import type { LanguageDefinition } from "../types";

export const SvelteDefinition: LanguageDefinition = {
  id: "svelte",
  extensions: [".svelte"],
  aliases: ["Svelte", "svelte"],
  mimeTypes: ["text/x-svelte"],
  detectionPatterns: [
    { pattern: /\{#(if|each|await|key)\b/, weight: 3 },
    { pattern: /\$state\s*\(|\$derived\s*\(|\$effect\s*\(/, weight: 3 },
    { pattern: /\bexport\s+let\s+\w+/, weight: 2 },
    { pattern: /\bon:\w+=|bind:\w+=/, weight: 2 },
  ],
};
