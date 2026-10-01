import { describe, expect, it } from "vitest";
import { detectLanguageFromContent } from "~/lib/monaco/utils";
import { languageDefinitions } from "~/lib/monaco/languages";
import { detectLanguage } from "~/lib/monaco/detect";

describe("CSV registration and detection", () => {
  it("registers CSV and TSV names", () => {
    const csv = languageDefinitions.find((l) => l.id === "csv");
    expect(csv).toMatchObject({ extensions: [".csv", ".tsv"], mimeTypes: expect.arrayContaining(["text/csv"]) });
    expect(csv?.aliases).toEqual(expect.arrayContaining(["CSV", "TSV"]));
  });

  it.each([
    "name,age,city\nAda,36,London\nBob,42,Berlin",
    "name;age;city\nAda;36;London\nBob;42;Berlin",
    "name\tage\tcity\nAda\t36\tLondon\nBob\t42\tBerlin",
  ])("detects three consistent delimited rows", (content) => {
    expect(detectLanguageFromContent(content)).toBe("csv");
  });

  it("prefers a strong CSV shape over a model guess", async () => {
    const content = "name,age,city\nAda,36,London\nBob,42,Berlin";
    expect(await detectLanguage(content, async () => [{ languageId: "js", confidence: 0.8 }])).toBe("csv");
  });

  it.each([
    '{"values": ["a,b,c", "d,e,f", "g,h,i"]}',
    "<div>a,b,c</div>\n<div>d,e,f</div>\n<div>g,h,i</div>",
    "This is prose, with commas, and clauses.\nIt remains prose, with commas, and clauses.\nThe third sentence, has commas, and clauses.",
    "This is prose, with commas, and clauses\nIt remains prose, with commas, and clauses\nThe third sentence, has commas, and clauses",
    "name,age,city\nAda,36\nBob,42,Berlin",
    "name,age,city\n\nAda,36,London\n\nBob,42,Berlin",
    "name,age,city\n{a,b,c}\nBob,42,Berlin",
    "name,age,city\n<span,a,b>\nBob,42,Berlin",
    "# Table\n| a,b,c | x,y,z |\n| --- | --- |\n| d,e,f | g,h,i |",
  ])("does not misdetect JSON, HTML, prose or irregular rows", (content) => {
    expect(detectLanguageFromContent(content)).not.toBe("csv");
  });
});
