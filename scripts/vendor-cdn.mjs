/** Build a literal-host matcher even if a future host contains regex syntax. */
export function buildCdnPattern(hosts) {
  const escaped = hosts.map((host) => host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`https://(?:${escaped.join("|")})`, "g");
}
