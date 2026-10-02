import type { LanguageDefinition } from "../types";

export const CsvDefinition: LanguageDefinition = {
  id: "csv",
  extensions: [".csv", ".tsv"],
  aliases: ["CSV", "TSV", "csv", "tsv"],
  mimeTypes: ["text/csv", "text/tab-separated-values"],
};
