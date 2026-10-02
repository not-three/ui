import { VENDOR_PATHS } from "../vendor";
import type { SandboxRunner } from "./types";
import { escapeHtml } from "./util";

export const MermaidRunner: SandboxRunner = {
  id: "mermaid",
  label: "Mermaid",
  languages: ["mermaid"],
  layout: "preview",
  usesVendor: true,
  build: ({ content, vendorBase }) => ({
    head: `<script src="${vendorBase}/${VENDOR_PATHS.mermaid}"></script>`,
    body: `<pre class="mermaid">${escapeHtml(content)}</pre>
<script>
try {
  mermaid.initialize({ startOnLoad: true, securityLevel: "strict", theme: "default" });
} catch (e) { console.error(String(e)); }
</script>`,
  }),
};
