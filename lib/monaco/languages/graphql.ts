import type { LanguageDefinition } from "../types";

export const GraphqlDefinition: LanguageDefinition = {
  id: "graphql",
  extensions: [".graphql", ".gql"],
  aliases: ["GraphQL", "graphql", "gql"],
  mimeTypes: ["application/graphql"],
  detectionPatterns: [
    { pattern: /\b(query|mutation|subscription)\s+\w*\s*[({]/, weight: 4 },
    { pattern: /\bfragment\s+\w+\s+on\s+\w+/, weight: 4 },
    { pattern: /\btype\s+\w+(\s+implements\s+\w+)?\s*\{/, weight: 3 },
    { pattern: /\(\s*\$\w+:\s*\w+!?\s*\)/, weight: 3 },
  ],
};
