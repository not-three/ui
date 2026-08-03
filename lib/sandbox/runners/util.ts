/**
 * JSON-embed a value inside an inline <script>. < escaping prevents
 * "</script>" (and "<!--") sequences; U+2028/9 are invalid in JS strings
 * when emitted raw into a document.
 */
export function embedJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Prevents user code from closing our <script> tag; inside JS string
// literals "<\/script" is equivalent to "</script" so semantics survive.
export function escapeScriptClose(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

/** Escape text for a double-quoted HTML attribute (popout srcdoc). */
export function escapeAttribute(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
