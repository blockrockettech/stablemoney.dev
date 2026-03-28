export function shortAddress(addr: string, head = 6, tail = 4): string {
  const t = addr.trim()
  if (t.length <= head + tail + 1) return t
  return `${t.slice(0, head)}…${t.slice(-tail)}`
}
