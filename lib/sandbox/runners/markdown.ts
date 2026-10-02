import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { embedJson } from "./util";

const STYLE = `<style>
html,body{margin:0;min-height:100%}
.markdown-preview{box-sizing:border-box;min-height:100vh;padding:24px max(24px,calc((100vw - 820px)/2));font:16px/1.65 system-ui,sans-serif;overflow-wrap:anywhere}
.markdown-preview[data-theme="dark"]{color-scheme:dark;background:#111;color:#e6e6e6}
.markdown-preview[data-theme="light"]{color-scheme:light;background:#fff;color:#222}
.markdown-preview a{color:#62a9ff}
.markdown-preview[data-theme="light"] a{color:#0969da}
.markdown-preview h1,.markdown-preview h2,.markdown-preview h3{line-height:1.3;margin:1.5em 0 .5em}
.markdown-preview h1{font-size:2em;border-bottom:1px solid #8885}
.markdown-preview h2{font-size:1.5em;border-bottom:1px solid #8885}
.markdown-preview table{border-collapse:collapse;display:block;overflow-x:auto;width:max-content;max-width:100%}
.markdown-preview th,.markdown-preview td{border:1px solid #8888;padding:6px 12px}
.markdown-preview tr:nth-child(even){background:#8882}
.markdown-preview pre{overflow-x:auto;padding:14px;border-radius:6px;background:#24292e;color:#e6edf3}
.markdown-preview[data-theme="light"] pre{background:#f6f8fa;color:#24292e}
.markdown-preview code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.markdown-preview :not(pre)>code{padding:2px 4px;border-radius:3px;background:#8883}
.markdown-preview .task-list-item{list-style:none}
.markdown-preview .task-list-item-checkbox{margin:0 .5em 0 -1.4em}
.markdown-preview .hljs-keyword,.markdown-preview .hljs-selector-tag{color:#c678dd}
.markdown-preview .hljs-string,.markdown-preview .hljs-attr{color:#98c379}
.markdown-preview .hljs-number,.markdown-preview .hljs-literal{color:#d19a66}
.markdown-preview[data-theme="light"] .hljs-keyword{color:#a626a4}
.markdown-preview[data-theme="light"] .hljs-string{color:#50a14f}
.markdown-preview .mermaid{background:transparent;text-align:center}
</style>`;

export const MarkdownRunner: SandboxRunner = {
  id: "markdown-preview",
  label: "Markdown preview",
  languages: ["markdown"],
  layout: "preview",
  usesVendor: true,
  noRepl: true,
  defaultTab: "console",
  build: ({ content, vendorBase, theme }) => ({
    head: `${STYLE}<script src="${vendorBase}/${VENDOR_PATHS.markdown}"></script><script src="${vendorBase}/${VENDOR_PATHS.mermaid}"></script>`,
    body: `<main class="markdown-preview" data-theme="${theme}"></main>
<script>
(function () {
  try {
    var tools = window.__not3Markdown;
    var md = new tools.MarkdownIt({
      html: false,
      linkify: true,
      typographer: false,
      highlight: function (code, language) {
        if (language && tools.hljs.getLanguage(language)) {
          try { return tools.hljs.highlight(code, { language: language }).value; }
          catch (e) { console.warn(String(e)); }
        }
        return md.utils.escapeHtml(code);
      }
    });
    md.use(tools.taskLists, { enabled: false });
    var slugCounts = Object.create(null);
    md.renderer.rules.heading_open = function (tokens, index, options, env, self) {
      var title = tokens[index + 1].content;
      var slug = title.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-") || "section";
      var count = slugCounts[slug] || 0;
      slugCounts[slug] = count + 1;
      tokens[index].attrSet("id", count ? slug + "-" + count : slug);
      return self.renderToken(tokens, index, options);
    };
    var originalFence = md.renderer.rules.fence;
    md.renderer.rules.fence = function (tokens, index, options, env, self) {
      var language = tokens[index].info.trim().split(/\\s+/)[0];
      if (language === "mermaid") {
        return '<pre class="mermaid">' + md.utils.escapeHtml(tokens[index].content) + '</pre>';
      }
      return originalFence(tokens, index, options, env, self);
    };
    var originalLink = md.renderer.rules.link_open;
    md.renderer.rules.link_open = function (tokens, index, options, env, self) {
      tokens[index].attrSet("target", "_blank");
      tokens[index].attrSet("rel", "noopener noreferrer");
      return originalLink ? originalLink(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
    };
    document.querySelector(".markdown-preview").innerHTML = md.render(${embedJson(content)});
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: ${embedJson(theme === "dark" ? "dark" : "default")} });
    mermaid.run({ querySelector: ".markdown-preview .mermaid" }).catch(function (e) { console.error(String(e)); });
  } catch (e) { console.error(String(e)); }
})();
</script>`,
  }),
};
