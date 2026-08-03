import { buildBootstrap } from "./bootstrap";

export type SandboxMode = "javascript" | "html";

/**
 * iframe sandbox flags. NEVER add allow-same-origin (the opaque origin is
 * what keeps note code away from the decryption key, cookies and storage)
 * or allow-top-navigation.
 */
export const SANDBOX_IFRAME_SANDBOX = "allow-scripts allow-modals";

export function sandboxModeForLanguage(id: string | null | undefined): SandboxMode | null {
  if (id === "javascript") return "javascript";
  if (id === "html") return "html";
  return null;
}

export function buildCsp(allowNetwork: boolean): string {
  const net = allowNetwork ? " https:" : "";
  return [
    "default-src 'none'",
    `script-src 'unsafe-inline' 'unsafe-eval'${net}`,
    `style-src 'unsafe-inline'${net}`,
    `img-src data: blob:${net}`,
    `font-src data:${net}`,
    `media-src data: blob:${net}`,
    `connect-src ${allowNetwork ? "https: wss:" : "'none'"}`,
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
}

// Prevents user code from closing our <script> tag; inside JS string
// literals "<\/script" is equivalent to "</script" so semantics survive.
function escapeScript(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

export function buildSrcdoc(opts: {
  mode: SandboxMode;
  content: string;
  token: string;
  allowNetwork: boolean;
}): string {
  const head =
    `<meta http-equiv="Content-Security-Policy" content="${buildCsp(opts.allowNetwork)}">` +
    `<script>${buildBootstrap(opts.token)}</script>`;
  if (opts.mode === "javascript") {
    return (
      "<!doctype html><html><head>" + head +
      "<style>body{background:#1e1e1e}</style></head><body>" +
      `<script>${escapeScript(opts.content)}</script></body></html>`
    );
  }
  // html mode: our doctype + CSP + bootstrap must come first; a duplicate
  // doctype mid-document would put the page into quirks mode, so strip it.
  const content = opts.content.replace(/^\s*<!doctype[^>]*>/i, "");
  return "<!doctype html>" + head + content;
}
