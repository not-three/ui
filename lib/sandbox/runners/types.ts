export type RunnerLayout = "console" | "preview";

export interface RunnerContext {
  /** Plaintext note content (the code to run). */
  content: string;
  /** Absolute URL prefix for self-hosted interpreter assets, e.g. "https://host/vendor". */
  vendorBase: string;
}

export interface RunnerDocument {
  /** Extra HTML for <head>, injected after the CSP meta and console bootstrap. */
  head?: string;
  /** HTML for the document body. */
  body: string;
  /** Emit body directly after head without <body> wrappers (html runner only). */
  bare?: boolean;
}

export interface SandboxRunner {
  /** Unique id, e.g. "python-pyodide". Also the engine-selector value. */
  id: string;
  /** Human label for the engine dropdown, e.g. "Python (Pyodide)". */
  label: string;
  /** Monaco language ids this runner can execute. */
  languages: string[];
  /** "console": panel shows only the console. "preview": iframe is visible. */
  layout: RunnerLayout;
  /** Widen the CSP so the iframe may load interpreter assets from the app origin. */
  usesVendor: boolean;
  /** Add blob: to script-src (runners that import compiled code as a Blob module). */
  scriptBlob?: boolean;
  /** Slow interpreter startup — the panel defaults auto-run to off. */
  heavy?: boolean;
  /** REPL language name shown in the console input; absent = JavaScript eval. */
  replLanguage?: string;
  build(ctx: RunnerContext): RunnerDocument;
}
