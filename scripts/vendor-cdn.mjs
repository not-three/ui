/** Replace every literal CDN URL prefix and count the references changed. */
export function replaceCdnUrls(text, hosts, replacement) {
  let result = text;
  let count = 0;
  for (const host of hosts) {
    const parts = result.split(`https://${host}`);
    count += parts.length - 1;
    result = parts.join(replacement);
  }
  return { text: result, count };
}
