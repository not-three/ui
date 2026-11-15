/* eslint-disable @typescript-eslint/no-explicit-any */
import * as monaco from "monaco-editor";
import { watch } from 'vue';
import { activeTheme } from '~/lib/theme/registry';
import editorWorker from "monaco-editor/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/languages/features/json/json.worker?worker";
import cssWorker from "monaco-editor/languages/features/css/css.worker?worker";
import htmlWorker from "monaco-editor/languages/features/html/html.worker?worker";
import tsWorker from "monaco-editor/languages/features/typescript/ts.worker?worker";
import {
  conf as yamlConf,
  language as yamlLanguage,
} from "monaco-editor/languages/definitions/yaml/yaml.js";
import {
  conf as jsConf,
  language as jsLanguage,
} from "monaco-editor/languages/definitions/javascript/javascript.js";
import {
  conf as htmlConf,
  language as htmlLanguage,
} from "monaco-editor/languages/definitions/html/html.js";

import { languageDefinitions } from "./languages";
import type { LanguageDefinition } from "./types";

let themeWatchInstalled = false;

function registerLanguage(lang: LanguageDefinition) {
  monaco.languages.register({
    id: lang.id,
    extensions: lang.extensions,
    aliases: lang.aliases,
    mimetypes: lang.mimeTypes,
  });

  // Set language configuration if provided
  if (lang.configuration) {
    monaco.languages.setLanguageConfiguration(lang.id, lang.configuration);
  }

  // Set tokenizer if provided
  if (lang.tokenizer)
    monaco.languages.setMonarchTokensProvider(lang.id, lang.tokenizer);
}

export async function setupMonaco() {
  (self as any).MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      switch (label) {
        case "json":
          return new jsonWorker();
        case "css":
        case "scss":
        case "less":
          return new cssWorker();
        case "html":
          return new htmlWorker();
        case "typescript":
        case "javascript":
          return new tsWorker();
        default:
          return new editorWorker();
      }
    },
  };

  for (const lang of languageDefinitions) registerLanguage(lang);

  // Docker Compose files are YAML; monaco has no dockercompose tokenizer, so
  // reuse the built-in YAML monarch tokenizer and configuration for it.
  monaco.languages.setMonarchTokensProvider("dockercompose", yamlLanguage);
  monaco.languages.setLanguageConfiguration("dockercompose", yamlConf);

  // jsx reuses monaco's javascript grammar (no dedicated jsx monarch grammar).
  monaco.languages.setMonarchTokensProvider("jsx", jsLanguage);
  monaco.languages.setLanguageConfiguration("jsx", jsConf);

  // vue SFCs are html-shaped; reuse monaco's html grammar.
  monaco.languages.setMonarchTokensProvider("vue", htmlLanguage);
  monaco.languages.setLanguageConfiguration("vue", htmlConf);

  // svelte files are also html-shaped; reuse the same grammar.
  monaco.languages.setMonarchTokensProvider("svelte", htmlLanguage);
  monaco.languages.setLanguageConfiguration("svelte", htmlConf);

  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {},
  });
  monaco.editor.defineTheme('not3-monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'function', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.selectionBackground': '#49483e',
    },
  });
  monaco.editor.defineTheme('not3-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#ffffff' },
  });
  monaco.editor.setTheme(activeTheme.value.monacoTheme);
  if (!themeWatchInstalled) {
    watch(activeTheme, theme => monaco.editor.setTheme(theme.monacoTheme));
    themeWatchInstalled = true;
  }

  // Set compiler options for TypeScript
  monaco.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    checkJs: false,
    noEmit: true,
    noResolve: true, // Ignores import errors
    module: monaco.typescript.ModuleKind.ESNext,
    target: monaco.typescript.ScriptTarget.ESNext,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  });

  // Set diagnostic options to suppress specific error codes (e.g., import errors)
  monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2792], // Error code for "Cannot find module"
  });
}
