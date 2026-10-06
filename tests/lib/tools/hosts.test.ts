import { expect, it, vi } from 'vitest';
import { createPageToolHost, createEditorToolHost } from '~/lib/tools/hosts';

it('creates a note from standalone output without a server call', () => {
  const store = { content: '', keepContent: false, selectedLanguage: null as string | null };
  const navigate = vi.fn();
  const host = createPageToolHost(store, navigate);
  expect(host.getNote()).toBeNull();
  host.createNote?.('result', 'json');
  expect(store).toMatchObject({ content: 'result', keepContent: true, selectedLanguage: 'json' });
  expect(navigate).toHaveBeenCalledWith('/');
});

it('uses Monaco selection and cursor edits for the editor host', () => {
  const store = { content: 'before', selectedLanguage: 'plaintext', detectedLanguage: null };
  const edits: unknown[] = [];
  const editor = {
    getSelection: () => ({ isEmpty: () => false, startLineNumber: 1, startColumn: 1 }),
    getModel: () => ({ getValueInRange: () => 'bef' }),
    getPosition: () => ({ lineNumber: 1, column: 4 }),
    executeEdits: (_source: string, value: unknown[]) => edits.push(value),
    revealPositionInCenter: vi.fn(), setPosition: vi.fn(), focus: vi.fn(),
  };
  const host = createEditorToolHost(store, () => editor as never);
  expect(host.getSelection()?.text).toBe('bef');
  host.replaceSelection('after');
  host.insertAtCursor('!');
  expect(edits).toHaveLength(2);
  host.revealPosition({ line: 2, column: 3 });
  expect(editor.revealPositionInCenter).toHaveBeenCalledWith({ lineNumber: 2, column: 3 });
});
