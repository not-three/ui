import type * as monaco from "monaco-editor";

export interface EditorConfig {
  value: string;
  language?: string;
  readonly?: boolean;
  filename?: string;
  theme?: string;
}

export interface LanguageInfo {
  id: string;
  extensions: string[];
  aliases: string[];
  mimeTypes: string[];
}

export interface LanguageMapping {
  extensions: string[];
  aliases?: string[];
  mimeTypes?: string[]; // Keep this for our internal use
}

export type TokenizerRuleAction =
  | string
  | string[]
  | {
      token: string;
      next?: string;
      switchTo?: string;
      nextEmbedded?: string;
      log?: string;
    };

// Using Monaco's types directly where possible
export interface LanguageTokenizer
  extends Omit<monaco.languages.IMonarchLanguage, "tokenizer"> {
  tokenizer: {
    [stateName: string]: monaco.languages.IMonarchLanguageRule[];
  };
}

export interface LanguageDefinition extends Omit<LanguageMapping, "mimeTypes"> {
  id: string;
  configuration?: monaco.languages.LanguageConfiguration;
  tokenizer?: LanguageTokenizer;
  mimeTypes?: string[];
  detectionPatterns?: {
    pattern: RegExp;
    weight?: number;
  }[];
}

export type Editor = monaco.editor.IStandaloneCodeEditor;
