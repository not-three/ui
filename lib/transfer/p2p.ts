import { FragmentData, Not3Client } from '@not3/sdk';

export function isP2PFragment(url: string): boolean {
  try {
    return FragmentData.fromURL(url).p2p;
  } catch {
    return false;
  }
}

export function absoluteApiBase(base: string, origin: string): string {
  const url = new URL(base, origin);
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
}

export function p2pApiFor(server: string | null, base: string, origin: string, password?: string): Not3Client {
  return new Not3Client({ baseUrl: absoluteApiBase(server || base, origin), password });
}

export function chunkTotals(size: number, payloadSize: number, bytes: number): { status: number; total: number } {
  if (payloadSize <= 0) return { status: 0, total: 0 };
  const total = Math.ceil(size / payloadSize);
  return { status: Math.min(total, Math.ceil(bytes / payloadSize)), total };
}
