import type { LanguageDefinition } from "../types";

export const MermaidDefinition: LanguageDefinition = {
  id: "mermaid",
  extensions: [".mmd", ".mermaid"],
  aliases: ["Mermaid", "mermaid"],
  mimeTypes: ["text/vnd.mermaid"],
  detectionPatterns: [
    { pattern: /^\s*(graph|flowchart)\s+(TB|TD|BT|RL|LR)\b/m, weight: 3 },
    { pattern: /^\s*(sequenceDiagram|classDiagram|erDiagram|stateDiagram|gantt|pie|mindmap|timeline)\b/m, weight: 3 },
    // A bare "word --> word" at line start reads exactly like plain-English
    // flow notes too ("Flow:\nA --> B\nB --> C"), so this is deliberately a
    // weak signal (low weight): it only tips the balance alongside the
    // stronger header/participant patterns above, or when it repeats many
    // times (an actual diagram body), never on its own against a couple of
    // incidental arrow lines.
    { pattern: /^\s*\w[\w-]*\s*(-->|==>|-\.->)\s*\w/m, weight: 0.4 },
    { pattern: /^\s*participant\s+\w+/m, weight: 2 },
  ],
};
