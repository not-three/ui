import { describe, expect, it } from 'vitest';
import { getTool, TOOLS } from '~/lib/tools/registry';
import { bytesInput, textInput } from '~/lib/tools/testing';
import { resolveInput, TEXT_FILE_LIMIT } from '~/lib/tools/input';

describe('tool registry', () => {
  it('has unique URL-safe ids and resolves each tool', () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(TOOLS.map(tool => tool.id)).size).toBe(TOOLS.length);
    for (const tool of TOOLS) {
      expect(tool.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(tool.keywords.length).toBeGreaterThan(0);
      expect(getTool(tool.id)).toBe(tool);
    }
    expect(getTool('missing')).toBeUndefined();
  });

  it('orders categories and titles and loads an implementation per definition', async () => {
    const order = ['lint', 'hash', 'encode', 'crypto', 'transform', 'generate', 'image'];
    expect(TOOLS).toEqual([...TOOLS].sort((a, b) =>
      order.indexOf(a.category) - order.indexOf(b.category) || a.title.localeCompare(b.title)));
    for (const tool of TOOLS) expect((await tool.load()).run).toBeTypeOf('function');
  });

  it('keeps a sibling test for each lazy implementation', async () => {
    const tests = import.meta.glob('../../../lib/tools/**/*.impl.test.ts');
    for (const tool of TOOLS) {
      expect(Object.keys(tests)).toContain(`../../../lib/tools/${tool.category}/${tool.id}.impl.test.ts`);
    }
  });

  it('registers every definition in the tool directories with useful catalogue metadata', () => {
    const modules = import.meta.glob('../../../lib/tools/{lint,hash,encode,crypto,transform,generate,image}/*.ts');
    const definitions = Object.keys(modules)
      .filter(path => !path.endsWith('.impl.ts') && !path.endsWith('.impl.test.ts') && !path.endsWith('.d.ts'))
      .filter(path => !/(?:shared|bytes)\.ts$/.test(path));
    expect(definitions.sort()).toEqual(TOOLS.map(tool => `../../../lib/tools/${tool.category}/${tool.id}.ts`).sort());
    for (const tool of TOOLS) {
      expect(tool.title.trim().length, tool.id).toBeGreaterThan(2);
      expect(tool.description.trim().length, tool.id).toBeGreaterThan(20);
      expect(tool.keywords.every(keyword => keyword.trim().length > 1), tool.id).toBe(true);
    }
  });
});

describe('input conversion', () => {
  it('streams UTF-8 text into a bytes slot', async () => {
    const value = await resolveInput({ kind: 'bytes' }, { source: 'text', text: 'é🙂' });
    expect(value.kind).toBe('bytes');
    if (value.kind === 'bytes') {
      expect(new Uint8Array(await new Response(value.stream).arrayBuffer())).toEqual(new TextEncoder().encode('é🙂'));
    }
  });

  it('reads a text file through File.stream and rejects above 16 MiB before reading', async () => {
    const small = new File(['hello'], 'one.txt');
    const input = await resolveInput({ kind: 'text' }, { source: 'file', file: small });
    expect(input).toMatchObject({ kind: 'text', text: 'hello' });
    let reads = 0;
    const huge = { name: 'huge.txt', size: TEXT_FILE_LIMIT + 1, stream() { reads++; throw Error('read'); } } as unknown as File;
    await expect(resolveInput({ kind: 'text' }, { source: 'file', file: huge })).rejects.toThrow('this tool needs text; file too large');
    expect(reads).toBe(0);
  });

  it('keeps file bytes as a stream', async () => {
    const file = new File(['abc'], 'data.bin');
    const input = await resolveInput({ kind: 'bytes' }, { source: 'file', file });
    expect(input).toMatchObject({ kind: 'bytes', name: 'data.bin', size: 3 });
    if (input.kind === 'bytes') expect(await new Response(input.stream).text()).toBe('abc');
  });

  it('supplies in-memory text and multi-chunk bytes to implementations', async () => {
    expect(textInput('abc')).toMatchObject({ kind: 'text', text: 'abc' });
    const input = bytesInput('abc');
    expect(input.kind).toBe('bytes');
    if (input.kind === 'bytes') expect(await new Response(input.stream).text()).toBe('abc');
  });
});
