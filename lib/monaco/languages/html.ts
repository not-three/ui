import type { LanguageDefinition } from "../types";

export const HtmlDefinition: LanguageDefinition = {
  id: "html",
  extensions: [".html", ".htm", ".xhtml"],
  aliases: ["HTML", "html"],
  mimeTypes: ["text/html"],
  detectionPatterns: [
    { pattern: /<\s*!DOCTYPE\s+html\s*>/i, weight: 2 },
    { pattern: /<\s*html\s*.*?>/i, weight: 2 },
    { pattern: /<\s*head\s*.*?>/i, weight: 1 },
    { pattern: /<\s*body\s*.*?>/i, weight: 1 },
    { pattern: /<\s*script\s*.*?>[\s\S]*?<\/\s*script\s*>/i, weight: 2 },
    { pattern: /<\s*link\s+.*?rel\s*=\s*["']stylesheet["'].*?>/i, weight: 1 },
    { pattern: /<\s*meta\s+.*?charset\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*div\s+.*?>/i, weight: 1 },
    { pattern: /<\s*input\s+.*?type\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*img\s+.*?src\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*a\s+.*?href\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    // Ordinary text/block-level elements (headings, paragraphs, lists,
    // tables, buttons, sections) previously had no signal at all here, so a
    // small fragment built only from these — e.g.
    // `<h1 style="...">Hello</h1>` — scored 0 outside of whatever
    // <script>/<div>/<a>/<img>/<input> happened to also be present, letting
    // an unrelated inline `console.log(...)` in a <script> tag tip a tied
    // or higher score toward javascript. Modest weight, and each variant
    // requires either a real attribute or actual wrapped text (not just the
    // bare tag name appearing somewhere) so this can't fire on an incidental
    // mention of e.g. "table" in prose.
    { pattern: /<\s*(h[1-6]|p|span|ul|ol|li|table|tr|td|th|button|section)\s+[a-zA-Z-]+\s*=/i, weight: 1 },
    { pattern: /<\s*(h[1-6]|p|span|li|button|td|th)\b[^>]*>[^<]+<\/\s*\1\s*>/i, weight: 1 },
  ],
};
