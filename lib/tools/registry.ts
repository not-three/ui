import type { ToolDefinition } from './types';
import { base64 } from './encode/base64';
import { hex } from './encode/hex';
import { url } from './encode/url';
import { jsonLint } from './lint/json-lint';
import { hash } from './hash/hash';
import { diff } from './transform/diff';
import { aes } from './crypto/aes';
import { caesar } from './crypto/caesar';
import { hmac } from './crypto/hmac';
import { jwt } from './crypto/jwt';
import { not3Payload } from './crypto/not3-payload';
import { rot13 } from './crypto/rot13';
import { keypair } from './generate/keypair';
import { password } from './generate/password';

export const TOOLS: ToolDefinition[] = [jsonLint, hash, base64, hex, url, not3Payload, aes, caesar, hmac, jwt, rot13, diff, keypair, password];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find(tool => tool.id === id);
}
