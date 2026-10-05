import { expect, test } from 'vitest';
import { run } from './keypair.impl';
const context = { signal: new AbortController().signal, reportProgress() {} };
test.each(['RSA-OAEP', 'RSA-PSS', 'ECDSA'])('exports importable %s PEM keys', async algorithm => {
  const output = await run({}, { algorithm, size: algorithm === 'ECDSA' ? 'P-256' : '2048' }, context);
  expect(output.kind).toBe('multi');
  if (output.kind !== 'multi') return;
  const publicPem = output.parts[0]?.output;
  const privatePem = output.parts[1]?.output;
  expect(publicPem).toMatchObject({ kind: 'text', text: expect.stringContaining('BEGIN PUBLIC KEY') });
  expect(privatePem).toMatchObject({ kind: 'text', text: expect.stringContaining('BEGIN PRIVATE KEY') });
});
test('generated RSA-OAEP keys can be imported and decrypt a message', async () => {
  const output = await run({}, { algorithm: 'RSA-OAEP', size: '2048' }, context);
  if (output.kind !== 'multi') throw new Error('Expected key pair');
  const publicPem = output.parts[0]?.output;
  const privatePem = output.parts[1]?.output;
  if (publicPem?.kind !== 'text' || privatePem?.kind !== 'text') throw new Error('Expected PEM');
  const der = (value: string) => Uint8Array.from(atob(value.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')), char => char.charCodeAt(0));
  const publicKey = await crypto.subtle.importKey('spki', der(publicPem.text), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const privateKey = await crypto.subtle.importKey('pkcs8', der(privatePem.text), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
  const cipher = await crypto.subtle.encrypt('RSA-OAEP', publicKey, new TextEncoder().encode('usable'));
  expect(new TextDecoder().decode(await crypto.subtle.decrypt('RSA-OAEP', privateKey, cipher))).toBe('usable');
});
test('ECDSA runs with default curve when only algorithm changes', async () => {
  const output = await run({}, { algorithm: 'ECDSA' }, context);
  expect(output.kind).toBe('multi');
});
test('reports unsupported Ed25519 without blocking other algorithms', async () => {
  const original = crypto.subtle.generateKey.bind(crypto.subtle);
  const spy = (await import('vitest')).vi.spyOn(crypto.subtle, 'generateKey').mockImplementation(async algorithm => {
    if (typeof algorithm === 'object' && algorithm.name === 'Ed25519') throw new DOMException('Unsupported', 'NotSupportedError');
    return original(algorithm, true, ['sign', 'verify']);
  });
  try {
    await expect(run({}, { algorithm: 'Ed25519' }, context)).rejects.toThrow(/not supported by this browser/i);
    expect((await run({}, { algorithm: 'ECDSA', curve: 'P-256' }, context)).kind).toBe('multi');
  } finally { spy.mockRestore(); }
});
test.each([
  { algorithm: 'RSA-PSS', rsaBits: '4096', curve: 'P-256' },
  { algorithm: 'ECDSA', rsaBits: '2048', curve: 'P-384' },
])('exports usable $algorithm keys with requested size', async options => {
  const output = await run({}, options, context);
  if (output.kind !== 'multi') throw new Error('Expected key pair');
  const publicPem = output.parts[0]?.output;
  const privatePem = output.parts[1]?.output;
  if (publicPem?.kind !== 'text' || privatePem?.kind !== 'text') throw new Error('Expected PEM');
  const der = (value: string) => Uint8Array.from(atob(value.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')), char => char.charCodeAt(0));
  const params = options.algorithm === 'RSA-PSS' ? { name: 'RSA-PSS', hash: 'SHA-256' } : { name: 'ECDSA', namedCurve: options.curve };
  const publicKey = await crypto.subtle.importKey('spki', der(publicPem.text), params, false, ['verify']);
  const privateKey = await crypto.subtle.importKey('pkcs8', der(privatePem.text), params, false, ['sign']);
  const signatureParams = options.algorithm === 'RSA-PSS' ? { name: 'RSA-PSS', saltLength: 32 } : { name: 'ECDSA', hash: options.curve === 'P-384' ? 'SHA-384' : 'SHA-256' };
  const message = new TextEncoder().encode('usable');
  const signature = await crypto.subtle.sign(signatureParams, privateKey, message);
  expect(await crypto.subtle.verify(signatureParams, publicKey, signature, message)).toBe(true);
});
