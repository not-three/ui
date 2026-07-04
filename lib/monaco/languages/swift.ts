import type { LanguageDefinition } from "../types";

export const SwiftDefinition: LanguageDefinition = {
  id: "swift",
  extensions: [".swift"],
  aliases: ["Swift", "swift"],
  mimeTypes: ["text/x-swift"],
  detectionPatterns: [
    { pattern: /\bimport\s+(Foundation|UIKit|SwiftUI|Combine)\b/, weight: 4 },
    { pattern: /\bfunc\s+\w+\s*\(/, weight: 2 },
    { pattern: /\bguard\s+let\b/, weight: 4 },
    { pattern: /@(State|Published|ObservedObject|IBOutlet|IBAction|main)\b/, weight: 3 },
    { pattern: /\b(var|let)\s+\w+\s*:\s*\[?\w+\]?[?!]/, weight: 2 },
  ],
};
