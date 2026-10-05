import type { ToolRun } from '../types';
import { pem } from '../crypto/bytes';
export const run: ToolRun = async (_inputs, options, context) => {
  const algorithm = String(options.algorithm || 'RSA-PSS');
  const rsaBits = String(options.rsaBits ?? options.size ?? '2048');
  const curve = String(options.curve ?? options.size ?? 'P-256');
  let params: RsaHashedKeyGenParams | EcKeyGenParams | Algorithm;
  let usages: KeyUsage[];
  if (algorithm === 'RSA-OAEP' || algorithm === 'RSA-PSS') {
    if (rsaBits !== '2048' && rsaBits !== '4096') throw new Error('RSA size must be 2048 or 4096');
    params = { name: algorithm, modulusLength: Number(rsaBits), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
    usages = algorithm === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify'];
  } else if (algorithm === 'ECDSA') {
    if (curve !== 'P-256' && curve !== 'P-384') throw new Error('ECDSA curve must be P-256 or P-384');
    params = { name: 'ECDSA', namedCurve: curve };
    usages = ['sign', 'verify'];
  } else if (algorithm === 'Ed25519') {
    params = { name: 'Ed25519' };
    usages = ['sign', 'verify'];
  } else throw new Error('Unsupported key algorithm');
  let pair: CryptoKeyPair;
  try { pair = await crypto.subtle.generateKey(params, true, usages) as CryptoKeyPair; }
  catch (error) {
    if (algorithm === 'Ed25519') throw new Error('Ed25519 is not supported by this browser', { cause: error });
    throw error;
  }
  if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const publicPem = pem('PUBLIC KEY', new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey)));
  const privatePem = pem('PRIVATE KEY', new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey)));
  return { kind: 'multi', parts: [
    { label: 'Public key', output: { kind: 'text', text: publicPem, filename: 'public.pem' } },
    { label: 'Private key', output: { kind: 'text', text: privatePem, filename: 'private.pem' } },
  ] };
};
