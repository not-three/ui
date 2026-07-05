import type { LanguageDefinition } from "../types";

export const PowershellDefinition: LanguageDefinition = {
  id: "powershell",
  extensions: [".ps1", ".psm1"],
  aliases: ["PowerShell", "powershell", "ps1"],
  mimeTypes: ["application/x-powershell"],
  detectionPatterns: [
    { pattern: /\b(Get|Set|New|Remove|Invoke|Start|Stop|Write|Test)-\w+/, weight: 4 },
    { pattern: /\bparam\s*\(/, weight: 3 },
    { pattern: /\[(Parameter|CmdletBinding)\b/, weight: 4 },
    { pattern: /\$\w+\s*=/, weight: 1 },
    { pattern: /\s-(eq|ne|gt|lt|match|contains)\b/, weight: 2 },
  ],
};
