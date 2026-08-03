import type { SandboxRunner } from "./types";

export const HtmlRunner: SandboxRunner = {
  id: "html",
  label: "HTML",
  languages: ["html"],
  layout: "preview",
  usesVendor: false,
  build: ({ content }) => ({
    // bare: user markup may be a full document; wrapping it in another
    // <body> would nest documents. A duplicate doctype mid-document would
    // switch the page to quirks mode, so strip a leading one.
    bare: true,
    body: content.replace(/^\s*<!doctype[^>]*>/i, ""),
  }),
};
