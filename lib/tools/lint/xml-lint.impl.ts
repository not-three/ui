import type { ToolRun } from '../types';
import { invalid, sourceText, valid } from './shared';

export const run: ToolRun = async (inputs) => {
  const source = sourceText(inputs);
  const document = new DOMParser().parseFromString(source, 'application/xml');
  const error = document.querySelector('parsererror');
  if (!error) return valid('Valid XML');
  const message = error.textContent?.trim() || 'Invalid XML';
  const location = /(?:line|Line)\s*(?:number)?\s*[:=]?\s*(\d+)(?:[^\d]+(?:column|Column)\s*(?:number)?\s*[:=]?\s*(\d+))?/.exec(message);
  return invalid(message, location ? Number(location[1]) : undefined, location?.[2] ? Number(location[2]) : undefined);
};
