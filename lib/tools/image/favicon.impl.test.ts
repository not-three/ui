import { expect, it } from 'vitest';
import { solidBitmap } from '../../image/testing';
import type { ToolInput } from '../types';
import { run, squareRaster } from './favicon.impl';

it('centre-crops a wide bitmap before resizing', () => {
  const source = solidBitmap(4,2,[0,0,0,255]) as unknown as {width:number;height:number;data:Uint8ClampedArray};
  source.data.set([255,0,0,255], 4);
  expect([...squareRaster(source).data.subarray(0,4)]).toEqual([255,0,0,255]);
});
it('writes ICO PNG entries and selected PNG sizes with HTML and manifest snippets', async () => {
  const input: ToolInput = { kind:'image', bitmap:solidBitmap(2,2,[255,0,0,255]), width:2, height:2, bytes:new Uint8Array(), mimeType:'image/png', name:'brand.png' };
  const result = await run({ input }, { size16:true, size32:true, size48:true, size64:false, size128:false, size180:false, size192:false, size512:false }, { signal:new AbortController().signal, reportProgress:()=>{} });
  expect(result.kind).toBe('multi');
  if (result.kind !== 'multi') return;
  const ico = result.parts.find(part => part.label === 'favicon.ico')?.output;
  expect(ico?.kind).toBe('bytes');
  if (ico?.kind === 'bytes') {
    expect([...ico.bytes.subarray(0,6)]).toEqual([0,0,1,0,3,0]);
    expect([ico.bytes[6],ico.bytes[22],ico.bytes[38]]).toEqual([16,32,48]);
  }
  expect(result.parts.filter(part => part.output.kind === 'image')).toHaveLength(3);
  expect(result.parts.find(part => part.label === 'HTML')?.output).toMatchObject({ kind:'text', text:expect.stringContaining('favicon.ico') });
  expect(result.parts.find(part => part.label === 'Manifest')?.output).toMatchObject({ kind:'text', text:expect.stringContaining('icon-48.png') });
});
