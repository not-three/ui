/// <reference types="vite/client" />
import { detectLanguageFromContent } from "./utils";
import { languageDefinitions } from "./languages";

export type ModelRunner = (
  content: string,
) => Promise<{ languageId: string; confidence: number }[]>;

// guesslang model ids -> our monaco language ids (unlisted ids are unsupported)
const GUESSLANG_TO_MONACO: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  go: "go",
  php: "php",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  swift: "swift",
  dart: "dart",
  lua: "lua",
  pl: "perl",
  r: "r",
  ps1: "powershell",
  dockerfile: "dockerfile",
  css: "css",
  scss: "scss",
  html: "html",
  xml: "xml",
  json: "json",
  yaml: "yaml",
  toml: "toml",
  ini: "ini",
  md: "markdown",
  sh: "shell",
  sql: "sql",
};

// Same ballpark VS Code uses before it trusts the model.
const MIN_CONFIDENCE = 0.2;

let defaultRunner: ModelRunner | null = null;
let modelBroken = false;

async function loadDefaultRunner(): Promise<ModelRunner | null> {
  if (modelBroken) return null;
  if (defaultRunner) return defaultRunner;
  try {
    const { ModelOperations } = await import("@vscode/vscode-languagedetection");
    const ops = new ModelOperations({
      modelJsonLoaderFunc: async () =>
        (await import("@vscode/vscode-languagedetection/model/model.json"))
          .default,
      weightsLoaderFunc: async () => {
        const url = (
          await import(
            "@vscode/vscode-languagedetection/model/group1-shard1of1.bin?url"
          )
        ).default;
        return (await fetch(url)).arrayBuffer();
      },
    });
    defaultRunner = (content) => ops.runModel(content);
    return defaultRunner;
  } catch (e) {
    console.error("Language detection model failed to load", e);
    modelBroken = true;
    return null;
  }
}

/**
 * Hybrid language detection: the ML model wins when it is confident and the
 * language is one we register; otherwise fall back to regex scoring.
 * Pass a custom runner in tests; without one the real model is lazy-loaded.
 */
export async function detectLanguage(
  content: string,
  runner?: ModelRunner,
): Promise<string> {
  if (!content.trim()) return "plaintext";
  const model = runner ?? (await loadDefaultRunner());
  if (model) {
    try {
      const results = await model(content);
      const best = results[0];
      if (best && best.confidence >= MIN_CONFIDENCE) {
        const mapped = GUESSLANG_TO_MONACO[best.languageId];
        if (mapped && languageDefinitions.some((l) => l.id === mapped)) {
          return mapped;
        }
      }
    } catch (e) {
      console.error("Language detection model failed", e);
      if (!runner) modelBroken = true;
    }
  }
  return detectLanguageFromContent(content);
}
