/** Replace CDN URLs only when the configured hostname ends at the match. */
export function replaceCdnUrls(text, hosts, replacement) {
  let result = text;
  let count = 0;
  for (const host of hosts) {
    const needle = `https://${host}`;
    let output = "";
    let start = 0;
    let index = result.indexOf(needle, start);
    while (index !== -1) {
      output += result.slice(start, index);
      const next = result[index + needle.length];
      if (next === undefined || !/[A-Za-z0-9.-]/.test(next)) {
        output += replacement;
        count++;
      } else {
        output += needle;
      }
      start = index + needle.length;
      index = result.indexOf(needle, start);
    }
    result = output + result.slice(start);
  }
  return { text: result, count };
}
