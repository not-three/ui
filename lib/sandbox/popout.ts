import { CONSOLE_LEVELS, SANDBOX_CONSOLE_MESSAGE } from "./protocol";
import type { RunnerLayout } from "./runners/types";
import { embedJson, escapeAttribute, escapeHtml } from "./runners/util";
import { SANDBOX_IFRAME_SANDBOX } from "./srcdoc";

// Mirrors the panel's own MAX_ENTRIES (components/editor/sandbox.vue). The
// popout is same-origin with the app AND script-connected to the opener
// (live window.opener, populated via document.write), so it runs in the
// SAME renderer process as the app page. An unbounded console here is not
// just a memory leak in a throwaway tab — a note that logs in a tight loop
// can grow the DOM until the shared renderer is killed, taking the note
// editor and any unsaved plaintext down with it. Keep this cap in sync with
// the panel's.
const MAX_ENTRIES = 500;

/**
 * Standalone host page for the popout window. The popup itself is
 * app-origin (about:blank inherits the opener), but it only ever contains
 * OUR host markup — the note code stays inside the nested sandboxed iframe
 * with an opaque origin, exactly like in the panel. The host validates
 * event.source + per-run token before rendering console lines.
 *
 * SECURITY: this document is app-origin. Unlike the sandboxed note iframe,
 * anything rendered here runs with the app's real origin. The only
 * permitted sink for untrusted message data is `textContent` — never
 * `innerHTML` or a style/attribute built from raw strings. If this ever
 * grows `%c`-style console formatting (the panel already has it), the
 * segment CSS MUST be passed through `sanitizeConsoleCss` from
 * `lib/sandbox/protocol.ts` before it touches any style property; raw `%c`
 * CSS in an app-origin document is a UI-spoofing and url()-exfiltration
 * vector.
 */
export function buildPopoutDocument(opts: {
  title: string;
  srcdoc: string;
  token: string;
  layout: RunnerLayout;
}): string {
  const layoutCss =
    opts.layout === "console"
      ? "iframe{display:none}#console{flex:1}"
      : "iframe{flex:1}#console{height:10rem;flex:none;border-top:1px solid #000}";
  return (
    "<!doctype html><html><head><meta charset=\"utf-8\">" +
    `<title>${escapeHtml(opts.title)}</title>` +
    "<style>" +
    "html,body{margin:0;height:100%;background:#111;color:#eee;font-family:monospace}" +
    ".wrap{display:flex;flex-direction:column;height:100%}" +
    "iframe{border:0;width:100%;background:#fff}" +
    "#console{overflow-y:auto;font-size:12px;padding:4px 8px;white-space:pre-wrap;word-break:break-all}" +
    layoutCss +
    "</style></head><body><div class=\"wrap\">" +
    `<iframe id="frame" sandbox="${SANDBOX_IFRAME_SANDBOX}" referrerpolicy="no-referrer" srcdoc="${escapeAttribute(opts.srcdoc)}"></iframe>` +
    "<div id=\"console\"></div></div>" +
    "<script>" +
    "(function () {" +
    `var TOKEN = ${embedJson(opts.token)};` +
    `var CONSOLE_MSG = ${embedJson(SANDBOX_CONSOLE_MESSAGE)};` +
    // Whitelist against the protocol's own level list (not hand-copied) so
    // this cannot drift from lib/sandbox/protocol.ts, and so an attacker
    // cannot pick an arbitrary d.level to probe object internals via
    // COLORS[d.level] (e.g. "__proto__"/"constructor"/"toString").
    `var LEVELS = ${embedJson(CONSOLE_LEVELS)};` +
    `var MAX_LINES = ${embedJson(MAX_ENTRIES)};` +
    "var COLORS = { log: \"#eee\", info: \"#7cb7ff\", warn: \"#ffd75e\", error: \"#ff7a7a\", debug: \"#888\" };" +
    "var frame = document.getElementById(\"frame\");" +
    "var out = document.getElementById(\"console\");" +
    "window.addEventListener(\"message\", function (event) {" +
    "if (!frame.contentWindow || event.source !== frame.contentWindow) return;" +
    "var d = event.data;" +
    "if (!d || typeof d !== \"object\" || d.token !== TOKEN || d.type !== CONSOLE_MSG) return;" +
    "if (LEVELS.indexOf(d.level) === -1) return;" +
    "if (d.level === \"clear\") { out.textContent = \"\"; return; }" +
    "var line = document.createElement(\"div\");" +
    "line.style.color = COLORS[d.level] || \"#eee\";" +
    "line.textContent = Array.isArray(d.args) ? d.args.map(String).join(\" \") : \"\";" +
    "out.appendChild(line);" +
    // Shared-renderer-process guard (see module doc comment): drop the
    // oldest lines once the cap is hit instead of growing the DOM forever.
    "while (out.childNodes.length > MAX_LINES) out.removeChild(out.firstChild);" +
    "out.scrollTop = out.scrollHeight;" +
    "});" +
    "})();" +
    "</script></body></html>"
  );
}
