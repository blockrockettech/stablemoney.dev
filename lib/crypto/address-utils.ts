export function shortAddress(addr: string, head = 6, tail = 4): string {
  const address = addr.trim()
  if (address.length <= head + tail + 1) return address
  return `${address.slice(0, head)}…${address.slice(-tail)}`
}
