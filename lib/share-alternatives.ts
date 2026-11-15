import { ShareGenerator, type ShareAlternative, type ShareTarget } from '@not3/sdk';

export function createShareAlternatives(
  target: ShareTarget,
  server: string,
  defaultServer: string,
  uiBase: string,
  origin: string,
): ShareAlternative[] {
  const absoluteBase = (value: string) => {
    const url = new URL(value, origin);
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.toString();
  };
  const apiUrl = absoluteBase(server);
  return new ShareGenerator({
    apiUrl,
    uiUrl: absoluteBase(uiBase),
    storeServer: apiUrl !== absoluteBase(defaultServer),
  }).alternatives(target);
}
