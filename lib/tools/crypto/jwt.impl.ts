import type { ToolRun, ToolReportItem } from '../types';
import { parsePem, requiredText, webBuffer } from './bytes';
function decodeBase64url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) throw new Error('Malformed JWT base64url');
  try {
    return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), char => char.charCodeAt(0));
  } catch { throw new Error('Malformed JWT base64url'); }
}
function jsonPart(part: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decodeBase64url(part)));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new Error('Malformed JWT JSON or base64url'); }
}
export const run: ToolRun = async (inputs, _options, context) => {
  const token = requiredText(inputs.input, 'JWT').trim();
  const segments = token.split('.');
  if (segments.length !== 3 || !segments[0] || !segments[1]) throw new Error('Malformed JWT token');
  const header = jsonPart(segments[0]);
  const payload = jsonPart(segments[1]);
  const algorithm = header.alg;
  const keyText = inputs.key?.kind === 'text' ? inputs.key.text.trim() : '';
  const item: ToolReportItem = { level: 'error', message: 'Signature absent; token is not verified' };
  if (segments[2]) {
    const signature = decodeBase64url(segments[2]);
    if (!keyText) item.message = 'Verification key is required; token is not verified';
    else if (['HS256', 'HS384', 'HS512'].includes(String(algorithm))) {
      const hash = `SHA-${String(algorithm).slice(2)}`;
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(keyText), { name: 'HMAC', hash }, false, ['verify']);
      const valid = await crypto.subtle.verify('HMAC', key, webBuffer(signature), new TextEncoder().encode(`${segments[0]}.${segments[1]}`));
      item.level = valid ? 'success' : 'error'; item.message = valid ? 'Signature verified' : 'Invalid signature';
    } else if (algorithm === 'RS256' || algorithm === 'ES256') {
      const der = parsePem(keyText, 'PUBLIC KEY');
      const params = algorithm === 'RS256' ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } : { name: 'ECDSA', namedCurve: 'P-256' };
      let valid = false;
      try {
        const key = await crypto.subtle.importKey('spki', webBuffer(der), params, false, ['verify']);
        valid = await crypto.subtle.verify(algorithm === 'RS256' ? { name: 'RSASSA-PKCS1-v1_5' } : { name: 'ECDSA', hash: 'SHA-256' }, key, webBuffer(signature), new TextEncoder().encode(`${segments[0]}.${segments[1]}`));
      } catch { item.message = 'Invalid public key PEM or signature'; }
      if (valid) { item.level = 'success'; item.message = 'Signature verified'; }
      else if (item.message !== 'Invalid public key PEM or signature') item.message = 'Invalid signature';
    } else item.message = `Unsupported JWT algorithm: ${String(algorithm)}`;
  }
  if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  return { kind: 'multi', parts: [
    { label: 'Decoded token', output: { kind: 'text', text: JSON.stringify({ header, payload }, null, 2), language: 'json' } },
    { label: 'Verification', output: { kind: 'report', items: [item] } },
  ] };
};
