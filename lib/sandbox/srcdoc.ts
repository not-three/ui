import { buildBootstrap } from "./bootstrap";
import type { SandboxRunner } from "./runners/types";

/**
 * iframe sandbox flags. NEVER add allow-same-origin (the opaque origin is
 * what keeps note code away from the decryption key, cookies and storage)
 * or allow-top-navigation.
 */
export const SANDBOX_IFRAME_SANDBOX = "allow-scripts allow-modals";

export interface CspOptions {
  /** User ticked the network checkbox: open https:/wss: for their code. */
  allowNetwork: boolean;
  /** App origin, set only for runners that load self-hosted vendor assets. */
  vendorOrigin: string | null;
  /** Allow blob: module scripts (compiled-in-iframe runners). */
  scriptBlob: boolean;
}

export function buildCsp(opts: CspOptions): string {
  const net = opts.allowNetwork ? " https:" : "";
  const vendor = opts.vendorOrigin ? ` ${opts.vendorOrigin}` : "";
  const blob = opts.scriptBlob ? " blob:" : "";
  const connect = [
    ...(opts.vendorOrigin ? [opts.vendorOrigin] : []),
    ...(opts.allowNetwork ? ["https:", "wss:"] : []),
  ];
  return [
    "default-src 'none'",
    `script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${blob}${vendor}${net}`,
    `style-src 'unsafe-inline'${vendor}${net}`,
    `img-src data: blob:${vendor}${net}`,
    `font-src data:${vendor}${net}`,
    `media-src data: blob:${vendor}${net}`,
    `worker-src blob:${vendor}`,
    `connect-src ${connect.length ? connect.join(" ") : "'none'"}`,
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
}

export interface SrcdocOptions {
  runner: SandboxRunner;
  content: string;
  token: string;
  allowNetwork: boolean;
  /** window.location.origin of the app; vendor assets are loaded from it. */
  origin: string;
}

export function buildSrcdoc(opts: SrcdocOptions): string {
  const doc = opts.runner.build({
    content: opts.content,
    vendorBase: `${opts.origin.replace(/\/$/, "")}/vendor`,
  });
  const csp = buildCsp({
    allowNetwork: opts.allowNetwork,
    vendorOrigin: opts.runner.usesVendor ? opts.origin : null,
    scriptBlob: opts.runner.scriptBlob === true,
  });
  const head =
    `<meta http-equiv="Content-Security-Policy" content="${csp}">` +
    `<script>${buildBootstrap(opts.token)}</script>` +
    (doc.head ?? "");
  if (doc.bare) return "<!doctype html>" + head + doc.body;
  const style =
    opts.runner.layout === "preview"
      ? "<style>body{background:#fff}</style>"
      : "<style>body{background:#1e1e1e}</style>";
  return (
    "<!doctype html><html><head>" + head + style + "</head><body>" +
    doc.body + "</body></html>"
  );
}
