import type { LanguageDefinition } from "../types";

export const XmlDefinition: LanguageDefinition = {
  id: "xml",
  extensions: [".xml", ".xsd", ".xsl", ".xslt", ".svg"],
  aliases: ["XML", "xml"],
  mimeTypes: [
    "application/xml",
    "text/xml",
    "application/atom+xml",
    "application/rss+xml",
  ],
  detectionPatterns: [
    // The XML declaration/prolog has no HTML5 equivalent — the strongest,
    // most XML-specific signal available.
    { pattern: /<\?xml\s+version\s*=\s*["'][^"']*["']\s*.*?\?>/i, weight: 5 },
    // xmlns / xmlns:prefix declarations are XML's namespacing mechanism;
    // HTML has nothing comparable.
    { pattern: /\bxmlns(:[\w.-]+)?\s*=\s*["'][^"']*["']/i, weight: 3 },
    // A namespace-prefixed tag (<ns:tag>, </ns:tag>, <ns:tag/>) — tag-name
    // namespacing doesn't exist in HTML. Requires the colon to sit directly
    // in the tag name (right after "<"/"</"), so it does not fire on
    // attribute-position colons like Vue's `:class=` or Svelte's
    // `on:click=`, which only ever follow whitespace inside a tag.
    { pattern: /<\/?[a-zA-Z][\w.-]*:[a-zA-Z][\w.-]*[\s/>]/, weight: 3 },
    // CDATA sections are XML/XHTML-only.
    { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, weight: 3 },
    // A processing instruction other than the <?xml …?> prolog itself
    // (e.g. <?xml-stylesheet …?>) — HTML has no equivalent construct.
    { pattern: /<\?(?!xml\b)[a-zA-Z][\w-]*(\s[^?]*)?\?>/i, weight: 2 },
    // An old-style DTD reference (SYSTEM/PUBLIC) is distinctly XML/XHTML;
    // deliberately narrower than a bare doctype match, since every ordinary
    // HTML5 page carries `<!DOCTYPE html>` with no DTD reference at all —
    // that used to count as an XML signal here and was part of why real
    // HTML pages lost to xml (see note below).
    { pattern: /<!DOCTYPE\s+\w+\s+(SYSTEM|PUBLIC)\b[^>]*>/i, weight: 2 },
    { pattern: /<\s*comment\s*.*?>[\s\S]*?<\/\s*comment\s*>/i, weight: 1 },
    // Two patterns used to live here: one matching ANY tag, one matching ANY
    // open/close pair, both weight 2 and uncapped beyond
    // MAX_MATCHES_PER_PATTERN (10). Any markup document — a plain HTML page,
    // a Vue SFC, a Svelte component — scored 20-40 from tag *count* alone
    // and drowned out those languages' own, far more specific patterns
    // (html.ts caps around 11, vue.ts/svelte.ts around 7-8), silently
    // routing real HTML/Vue/Svelte notes away from their (existing) sandbox
    // runners into a dead end with no runner at all. That's the same
    // "generic pattern outscores a specific one" failure already fixed for
    // lua vs. javascript. Kept here only as a last-resort nudge above
    // plaintext for genuinely tag-only content with none of the
    // XML-specific signals above (e.g. a bare, prolog-free, namespace-free
    // XML snippet like `<catalog><book/></catalog>`) — deliberately far too
    // weak, even at the match cap, to ever beat a real language's own score.
    { pattern: /<\s*\/?\s*\w+[^>]*>/, weight: 0.05 },
  ],
};
