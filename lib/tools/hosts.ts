import type { editor as MonacoEditor } from 'monaco-editor';
import type { ToolHost } from './types';

type NoteStore = { content: string; selectedLanguage: string | null; detectedLanguage?: string | null; keepContent?: boolean };
let currentEditor: MonacoEditor.IStandaloneCodeEditor | null = null;
export function registerToolEditor(editor: MonacoEditor.IStandaloneCodeEditor | null) { currentEditor = editor; }

export function createEditorToolHost(store: NoteStore, getEditor: () => MonacoEditor.IStandaloneCodeEditor | null = () => currentEditor): ToolHost {
  const language = () => store.selectedLanguage || store.detectedLanguage || 'plaintext';
  return {
    getNote: () => ({ text: store.content, language: language() }),
    getSelection: () => {
      const editor = getEditor();
      const selection = editor?.getSelection();
      if (!selection || selection.isEmpty()) return null;
      return { text: editor!.getModel()?.getValueInRange(selection) ?? '', language: language() };
    },
    replaceNote: text => { store.content = text; },
    replaceSelection: text => {
      const editor = getEditor(); const range = editor?.getSelection();
      if (editor && range) editor.executeEdits('tools', [{ range, text, forceMoveMarkers: true }]);
    },
    insertAtCursor: text => {
      const editor = getEditor(); const position = editor?.getPosition();
      if (!editor || !position) return;
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column, endColumn: position.column };
      editor.executeEdits('tools', [{ range, text, forceMoveMarkers: true }]);
    },
    revealPosition: position => {
      const editor = getEditor(); if (!editor) return;
      const target = { lineNumber: position.line, column: position.column };
      editor.revealPositionInCenter(target); editor.setPosition(target); editor.focus();
    },
  };
}

export function createPageToolHost(store: NoteStore, navigate: (path: string) => void): ToolHost {
  return {
    getNote: () => null, getSelection: () => null,
    replaceNote: () => {}, replaceSelection: () => {}, insertAtCursor: () => {}, revealPosition: () => {},
    createNote: (text, language) => {
      store.content = text; store.selectedLanguage = language || null; store.keepContent = true; navigate('/');
    },
  };
}
