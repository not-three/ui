import type { ToolRun } from '../types';

function format(bytes: Uint8Array): string {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const run: ToolRun = async (inputs, options) => {
  if (options.mode === 'inspect') {
    const input = inputs.input;
    if (!input || input.kind !== 'text') throw new Error('UUID text is required');
    const uuid = input.text.trim().toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)) {
      return { kind: 'report', items: [{ level: 'error', message: 'Invalid RFC 4122 UUID' }] };
    }
    const version = uuid[14]!;
    const rows = [['Version', version], ['Variant', 'RFC 4122']];
    if (version === '7') rows.push(['Timestamp', new Date(Number.parseInt(uuid.replaceAll('-', '').slice(0, 12), 16)).toISOString()]);
    return { kind: 'table', columns: ['Field', 'Value'], rows };
  }
  const version = options.version === 'v7' ? 'v7' : 'v4';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  if (version === 'v7') {
    const timestamp = BigInt(Date.now());
    for (let i = 5; i >= 0; i--) bytes[5 - i] = Number((timestamp >> BigInt(i * 8)) & 255n);
  }
  bytes[6] = (bytes[6]! & 0x0f) | (version === 'v7' ? 0x70 : 0x40);
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return { kind: 'text', text: format(bytes) };
};
