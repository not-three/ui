export type ToolCategory = 'lint' | 'hash' | 'encode' | 'crypto' | 'transform' | 'generate' | 'image';
export type ToolInputKind = 'text' | 'bytes' | 'image';
export type ToolSource = 'note' | 'selection' | 'file' | 'text';
export type ToolOptionValue = string | number | boolean;

export interface ToolInputSpec {
  id: string;
  label: string;
  kind: ToolInputKind;
  optional?: boolean;
  defaultSource?: 'note' | 'selection' | 'empty';
  stage?: 'crop' | 'region' | 'point';
}

export interface ImageRegion { x: number; y: number; width: number; height: number }
export interface ImagePoint { x: number; y: number }

export type ToolOptionSpec =
  | { id: string; label: string; type: 'select'; values: { value: string; label: string }[]; default: string; secret?: boolean }
  | { id: string; label: string; type: 'boolean'; default: boolean; secret?: boolean }
  | { id: string; label: string; type: 'number'; default: number; min?: number; max?: number; secret?: boolean }
  | { id: string; label: string; type: 'text'; default: string; placeholder?: string; secret?: boolean };

export type ToolInput =
  | { kind: 'text'; text: string; language?: string; source?: ToolSource }
  | { kind: 'bytes'; stream: ReadableStream<Uint8Array>; size?: number; name?: string; source?: ToolSource }
  | { kind: 'image'; bitmap: ImageBitmap; width: number; height: number; bytes: Uint8Array; mimeType: string; name?: string; region?: ImageRegion; point?: ImagePoint; firstFrameOnly?: boolean; source?: ToolSource };

export interface ToolPosition { line: number; column: number; endLine?: number; endColumn?: number }
export interface ToolReportItem { level: 'error' | 'warning' | 'info' | 'success'; message: string; position?: ToolPosition }
export type ToolSingleOutput =
  | { kind: 'text'; text: string; language?: string; filename?: string }
  | { kind: 'bytes'; bytes: Uint8Array; text?: string; filename?: string; mimeType?: string }
  | { kind: 'image'; blob: Blob; width: number; height: number; filename: string; exportable?: boolean }
  | { kind: 'diff'; left: string; right: string; displayLeft?: string; displayRight?: string; language?: string }
  | { kind: 'report'; items: ToolReportItem[]; text?: string; language?: string }
  | { kind: 'table'; columns: string[]; rows: (string | number | boolean | null)[][] };
export type ToolOutput = ToolSingleOutput | { kind: 'multi'; parts: { label: string; output: ToolSingleOutput }[] };

export interface ToolContext {
  signal: AbortSignal;
  reportProgress: (fraction: number) => void;
}
export type ToolRun = (inputs: Record<string, ToolInput>, options: Record<string, ToolOptionValue>, context: ToolContext) => Promise<ToolOutput>;
export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  category: ToolCategory;
  inputs: ToolInputSpec[];
  options: ToolOptionSpec[];
  heavy?: boolean;
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
