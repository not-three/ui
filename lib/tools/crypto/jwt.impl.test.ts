import { expect, test } from 'vitest';
import { run } from './jwt.impl';
import { textInput } from '../testing';
const context = { signal: new AbortController().signal, reportProgress() {} };
const enc = (value: string) => btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
test.each(['HS256', 'HS384', 'HS512'])('verifies %s and distinguishes a wrong secret', async algorithm => {
  const data = `${enc(JSON.stringify({ alg: algorithm, typ: 'JWT' }))}.${enc('{"sub":"123"}')}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('secret'), { name: 'HMAC', hash: `SHA-${algorithm.slice(2)}` }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  const token = `${data}.${enc(String.fromCharCode(...signature))}`;
  const good = await run({ input: textInput(token), key: textInput('secret') }, {}, context);
  expect(good).toMatchObject({ kind: 'multi', parts: [{ label: 'Decoded token' }, { label: 'Verification', output: { kind: 'report', items: [{ level: 'success' }] } }] });
  const bad = await run({ input: textInput(token), key: textInput('wrong') }, {}, context);
  expect(bad).toMatchObject({ kind: 'multi', parts: [{ label: 'Decoded token' }, { label: 'Verification', output: { kind: 'report', items: [{ level: 'error' }] } }] });
});
test('reports an absent signature and rejects malformed base64url and PEM', async () => {
  const unsigned = `${enc('{"alg":"HS256"}')}.${enc('{}')}.`;
  expect(await run({ input: textInput(unsigned), key: textInput('secret') }, {}, context)).toMatchObject({ kind: 'multi', parts: [{}, { output: { items: [{ level: 'error' }] } }] });
  await expect(run({ input: textInput('abc$.e30.sig'), key: textInput('x') }, {}, context)).rejects.toThrow(/base64url|token/i);
  const rs = `${enc('{"alg":"RS256"}')}.${enc('{}')}.AA`;
  await expect(run({ input: textInput(rs), key: textInput('not PEM') }, {}, context)).rejects.toThrow(/PEM/i);
});
test.each(['RS256', 'ES256'])('verifies a real %s public-key signature', async algorithm => {
  const params = algorithm === 'RS256'
    ? { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
    : { name: 'ECDSA', namedCurve: 'P-256' };
  const pair = await crypto.subtle.generateKey(params, true, ['sign', 'verify']) as CryptoKeyPair;
  const body = `${enc(JSON.stringify({ alg: algorithm }))}.${enc('{"sub":"alice"}')}`;
  const signature = new Uint8Array(await crypto.subtle.sign(algorithm === 'RS256' ? { name: 'RSASSA-PKCS1-v1_5' } : { name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, new TextEncoder().encode(body)));
  const der = new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey));
  const pem = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...der))}\n-----END PUBLIC KEY-----`;
  const output = await run({ input: textInput(`${body}.${enc(String.fromCharCode(...signature))}`), key: textInput(pem) }, {}, context);
  expect(output).toMatchObject({ kind: 'multi', parts: [{}, { output: { items: [{ level: 'success' }] } }] });
});
