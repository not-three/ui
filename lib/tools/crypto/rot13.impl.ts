import type { ToolRun } from '../types';
import { requiredText } from './bytes';
export const run: ToolRun = async inputs => ({ kind: 'text', text: requiredText(inputs.input, 'Input').replace(/[A-Za-z]/g, character => String.fromCharCode(character.charCodeAt(0) + (character.toLowerCase() <= 'm' ? 13 : -13))), language: 'plaintext' });
