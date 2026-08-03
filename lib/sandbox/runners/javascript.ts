import type { SandboxRunner } from "./types";
import { escapeScriptClose } from "./util";

export const JavascriptRunner: SandboxRunner = {
  id: "javascript",
  label: "JavaScript",
  languages: ["javascript"],
  layout: "console",
  usesVendor: false,
  build: ({ content }) => ({
    body: `<script>${escapeScriptClose(content)}</script>`,
  }),
};
