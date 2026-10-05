export type ToolCategory = 'lint' | 'hash' | 'encode' | 'crypto' | 'transform' | 'generate';
export type ToolInputKind = 'text' | 'bytes';
export type ToolSource = 'note' | 'selection' | 'file' | 'text';
export type ToolOptionValue = string | number | boolean;

export interface ToolInputSpec {
  id: string;
  label: string;
  kind: ToolInputKind;
  optional?: boolean;
  defaultSource?: 'note' | 'selection' | 'empty';
}

export type ToolOptionSpec =
  | { id: string; label: string; type: 'select'; values: { value: string; label: string }[]; default: string; secret?: boolean }
  | { id: string; label: string; type: 'boolean'; default: boolean; secret?: boolean }
  | { id: string; label: string; type: 'number'; default: number; min?: number; max?: number; secret?: boolean }
  | { id: string; label: string; type: 'text'; default: string; placeholder?: string; secret?: boolean };

export type ToolInput =
  | { kind: 'text'; text: string; language?: string; source?: ToolSource }
  | { kind: 'bytes'; stream: ReadableStream<Uint8Array>; size?: number; name?: string; source?: ToolSource };

export interface ToolPosition { line: number; column: number; endLine?: number; endColumn?: number }
export interface ToolReportItem { severity: 'error' | 'warning' | 'info' | 'success'; message: string; position?: ToolPosition }
export type ToolOutput =
  | { kind: 'text'; text: string; language?: string; filename?: string }
  | { kind: 'bytes'; bytes: Uint8Array; filename?: string; mimeType?: string }
  | { kind: 'diff'; left: string; right: string; language?: string }
  | { kind: 'report'; items: ToolReportItem[]; text?: string; language?: string }
  | { kind: 'table'; columns: string[]; rows: (string | number | boolean | null)[][] };

export interface ToolContext {
  signal: AbortSignal;
  reportProgress: (fraction: number) => void;
}
export type ToolRun = (inputs: Record<string, ToolInput>, options: Record<string, ToolOptionValue>, context: ToolContext) => Promise<ToolOutput>;
export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  inputs: ToolInputSpec[];
  options: ToolOptionSpec[];
  load: () => Promise<{ run: ToolRun }>;
}

export interface ToolSelection { text: string; language?: string }
export interface ToolNote { text: string; language?: string }
export interface ToolHost {
  getNote: () => ToolNote | null;
  getSelection: () => ToolSelection | null;
  replaceNote: (text: string) => void;
  replaceSelection: (text: string) => void;
  insertAtCursor: (text: string) => void;
  revealPosition: (position: ToolPosition) => void;
  createNote?: (text: string, language?: string) => void;
}
