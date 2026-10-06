import { expect, it } from 'vitest';
import { EDITOR_ACTIONS } from '~/lib/monaco/editor-actions';
import { TOOLS } from '~/lib/tools/registry';
import { compileKeybindings } from '~/lib/keybindings/compile';
import { buildKeymapView } from '~/lib/keybindings/keymap-view';

it('registers catalogue and every tool as bindable commands', () => {
  const ids = EDITOR_ACTIONS.map(action => action.id);
  expect(ids).toContain('not3.tools');
  for (const tool of TOOLS) expect(ids).toContain(`not3.tool.${tool.id}`);
  const compiled = compileKeybindings([{ key: 'ctrl+alt+b', command: 'not3.tool.base64' }], ids);
  expect(compiled.invalid).toEqual([]);
  expect(compiled.resolve('editorTextFocus', 'ctrl+alt+b')).toMatchObject({ kind: 'command', command: 'not3.tool.base64' });
  expect(compiled.resolve('not3.page', 'ctrl+alt+t')).toMatchObject({ kind: 'command', command: 'not3.tools' });
});

it('accepts a settings keybinding and exposes a keymap entry for every tool command', () => {
  const actions = EDITOR_ACTIONS.map(action => ({ id: action.id, label: action.label }));
  const ids = actions.map(action => action.id);
  for (const tool of TOOLS) {
    const command = `not3.tool.${tool.id}`;
    const compiled = compileKeybindings([{ key: 'ctrl+alt+u', command }], ids);
    expect(compiled.invalid, command).toEqual([]);
    expect(compiled.resolve('editorTextFocus', 'ctrl+alt+u'), command).toMatchObject({ kind: 'command', command });
    const view = JSON.parse(buildKeymapView(compiled, actions));
    expect(view.effectiveOverrides, command).toEqual(expect.arrayContaining([expect.objectContaining({ command })]));
  }
});
