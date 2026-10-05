import { expect, it } from 'vitest';
import { EDITOR_ACTIONS } from '~/lib/monaco/editor-actions';
import { TOOLS } from '~/lib/tools/registry';
import { compileKeybindings } from '~/lib/keybindings/compile';

it('registers catalogue and every tool as bindable commands', () => {
  const ids = EDITOR_ACTIONS.map(action => action.id);
  expect(ids).toContain('not3.tools');
  for (const tool of TOOLS) expect(ids).toContain(`not3.tool.${tool.id}`);
  const compiled = compileKeybindings([{ key: 'ctrl+alt+b', command: 'not3.tool.base64' }], ids);
  expect(compiled.invalid).toEqual([]);
  expect(compiled.resolve('editorTextFocus', 'ctrl+alt+b')).toMatchObject({ kind: 'command', command: 'not3.tool.base64' });
  expect(compiled.resolve('not3.page', 'ctrl+alt+t')).toMatchObject({ kind: 'command', command: 'not3.tools' });
});
