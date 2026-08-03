import { SANDBOX_CONSOLE_MESSAGE } from "./protocol";
import type { RunnerLayout } from "./runners/types";
import { embedJson, escapeAttribute, escapeHtml } from "./runners/util";
import { SANDBOX_IFRAME_SANDBOX } from "./srcdoc";

/**
 * Standalone host page for the popout window. The popup itself is
 * app-origin (about:blank inherits the opener), but it only ever contains
 * OUR host markup — the note code stays inside the nested sandboxed iframe
 * with an opaque origin, exactly like in the panel. The host validates
 * event.source + per-run token before rendering console lines.
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
    "var COLORS = { log: \"#eee\", info: \"#7cb7ff\", warn: \"#ffd75e\", error: \"#ff7a7a\", debug: \"#888\" };" +
    "var frame = document.getElementById(\"frame\");" +
    "var out = document.getElementById(\"console\");" +
    "window.addEventListener(\"message\", function (event) {" +
    "if (event.source !== frame.contentWindow) return;" +
    "var d = event.data;" +
    "if (!d || typeof d !== \"object\" || d.token !== TOKEN || d.type !== CONSOLE_MSG) return;" +
    "if (d.level === \"clear\") { out.textContent = \"\"; return; }" +
    "var line = document.createElement(\"div\");" +
    "line.style.color = COLORS[d.level] || \"#eee\";" +
    "line.textContent = Array.isArray(d.args) ? d.args.map(String).join(\" \") : \"\";" +
    "out.appendChild(line);" +
    "out.scrollTop = out.scrollHeight;" +
    "});" +
    "})();" +
    "</script></body></html>"
  );
}
