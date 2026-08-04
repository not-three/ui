import type { SandboxRunner } from "./types";
import { JavascriptRunner } from "./javascript";
import { HtmlRunner } from "./html";
import { TypescriptRunner } from "./typescript";
import { CoffeescriptRunner } from "./coffeescript";
import { MermaidRunner } from "./mermaid";
import { ReactRunner } from "./react";

/** Order matters: the first runner for a language is its default engine. */
export const SANDBOX_RUNNERS: SandboxRunner[] = [
  JavascriptRunner,
  HtmlRunner,
  TypescriptRunner,
  CoffeescriptRunner,
  MermaidRunner,
  // Must come after JavascriptRunner: ReactRunner also claims "javascript"
  // as an alternative engine, but registration order defines the default,
  // and plain JS notes must keep JavascriptRunner as their default.
  ReactRunner,
];

export function runnersForLanguage(languageId: string | null | undefined): SandboxRunner[] {
  if (!languageId) return [];
  return SANDBOX_RUNNERS.filter((r) => r.languages.includes(languageId));
}

export function defaultRunnerForLanguage(languageId: string | null | undefined): SandboxRunner | null {
  return runnersForLanguage(languageId)[0] ?? null;
}

export function getRunner(id: string): SandboxRunner | null {
  return SANDBOX_RUNNERS.find((r) => r.id === id) ?? null;
}

export function isRunnableLanguage(languageId: string | null | undefined): boolean {
  return runnersForLanguage(languageId).length > 0;
}
