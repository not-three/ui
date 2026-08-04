import type { LanguageDefinition } from "../types";

export const MermaidDefinition: LanguageDefinition = {
  id: "mermaid",
  extensions: [".mmd", ".mermaid"],
  aliases: ["Mermaid", "mermaid"],
  mimeTypes: ["text/vnd.mermaid"],
  detectionPatterns: [
    { pattern: /^\s*(graph|flowchart)\s+(TB|TD|BT|RL|LR)\b/m, weight: 3 },
    { pattern: /^\s*(sequenceDiagram|classDiagram|erDiagram|stateDiagram|gantt|pie|mindmap|timeline)\b/m, weight: 3 },
    { pattern: /-->|==>|-\.->/, weight: 1 },
    { pattern: /^\s*participant\s+\w+/m, weight: 2 },
  ],
};
