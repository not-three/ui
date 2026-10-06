import type { ToolReportItem, ToolRun } from '../types';
import { sourceText, valid } from './shared';

export const run: ToolRun = async (inputs, options) => {
  const ts = await import('typescript');
  const source = sourceText(inputs);
  const input = inputs.input;
  const language = String(options.language || (input?.kind === 'text' ? input.language : '') || 'auto');
  const isTs = language === 'typescript' || (language === 'auto' && input?.kind === 'text' && input.language === 'typescript');
  const filename = isTs ? 'input.ts' : 'input.js';
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, isTs ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const host: import('typescript').CompilerHost = {
    getSourceFile: name => name === filename ? file : undefined,
    getDefaultLibFileName: () => 'lib.d.ts',
    writeFile() {}, getCurrentDirectory: () => '/', getDirectories: () => [],
    fileExists: name => name === filename, readFile: name => name === filename ? source : undefined,
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram([filename], { noLib: true, noEmit: true, strict: true, allowJs: !isTs }, host);
  const diagnostics: import('typescript').Diagnostic[] = [...program.getSyntacticDiagnostics(file)];
  if (isTs && !diagnostics.length) diagnostics.push(...program.getSemanticDiagnostics(file));
  if (!diagnostics.length) return valid(isTs ? 'No TypeScript diagnostics' : 'Valid JavaScript syntax');
  const items: ToolReportItem[] = diagnostics.map(diagnostic => {
    const start = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const end = file.getLineAndCharacterOfPosition((diagnostic.start ?? 0) + (diagnostic.length ?? 0));
    return {
      level: diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      position: { line: start.line + 1, column: start.character + 1, endLine: end.line + 1, endColumn: end.character + 1 },
    };
  });
  return { kind: 'report', items };
};
