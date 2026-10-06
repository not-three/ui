import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run } from './data-url.impl';

it('encodes image bytes as a data URL and returns the original bytes in reverse mode', async () => {
  const bytes = Uint8Array.from([255,216,255,217]);
  const input: ToolInput = { kind:'image', bitmap:solidBitmap(1,1,[255,0,0,255]), width:1, height:1, bytes, mimeType:'image/jpeg', name:'portrait.jpg' };
  const context = { signal:new AbortController().signal, reportProgress:()=>{} };
  const forward = await run({ input }, { direction:'encode' }, context);
  expect(forward).toMatchObject({ kind:'text', text:'data:image/jpeg;base64,/9j/2Q==' });
  const reverse = await run({ input }, { direction:'decode' }, context);
  expect(reverse.kind).toBe('image');
  if (reverse.kind === 'image') expect([...new Uint8Array(await reverse.blob.arrayBuffer())]).toEqual([...bytes]);
});
