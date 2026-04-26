/** Mask IP-ish rate-limit keys for operator UIs (not cryptographic). */
export function maskIpForDisplay(raw: string): string {
  if (raw === 'unknown') return raw;
  const parts = raw.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  if (raw.includes(':')) return raw.slice(0, Math.min(raw.length, 12)) + '…';
  return raw.slice(0, 6) + '…';
}
