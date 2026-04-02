import { COIN_EIP_PROFILES } from "@/data/coinEips"
import { ethereumTokenAddress } from "@/data/coins"
import type { CoinEipImpl, CoinEipProfile, EipStatus } from "@/types/eip"

/** Fixed column order for matrix comparison (not auto-sorted by market cap) */
export const COIN_EIP_SYMBOLS = [
  "USDT",
  "USDC",
  "USDS",
  "USDe",
  "USD1",
  "DAI",
  "RLUSD",
  "GHO",
  "PYUSD",
  "TUSD",
  "FDUSD",
  "frxUSD",
] as const

export type CoinEipSymbol = (typeof COIN_EIP_SYMBOLS)[number]

/** GitHub source and eip.tools URLs for a numbered EIP/ERC, or null for non-numbered IDs. */
export function eipExternalLinks(eipId: string): { githubUrl: string; eipToolsUrl: string } | null {
  const m = /^(EIP|ERC)-(\d+)$/i.exec(eipId.trim())
  if (!m) return null
  const n = m[2]
  return {
    githubUrl: `https://github.com/ethereum/EIPs/blob/master/EIPS/eip-${n}.md`,
    eipToolsUrl: `https://eip.tools/eip/${n}`,
  }
}

export function eipAnchorId(eipId: string): string {
  const m = /^(EIP|ERC)-(\d+)$/i.exec(eipId.trim())
  if (m) return `eip-${m[2]}`
  return eipId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getCoinEipProfile(symbol: string): CoinEipProfile | undefined {
  const raw = COIN_EIP_PROFILES.find((p) => p.symbol === symbol)
  if (!raw) return undefined
  const addr = ethereumTokenAddress(symbol)
  return addr ? { ...raw, contractAddress: addr } : raw
}

export function getEipImplementation(
  symbol: string,
  eipId: string,
): CoinEipImpl | undefined {
  return getCoinEipProfile(symbol)?.implementations.find((i) => i.eipId === eipId)
}

/** Matrix cell: missing profile row defaults to unknown (not yet verified) */
export function getCellStatus(symbol: string, eipId: string): EipStatus {
  return getEipImplementation(symbol, eipId)?.status ?? "unknown"
}

export function countImplementedEips(symbol: string): number | null {
  const p = getCoinEipProfile(symbol)
  if (!p) return null
  return p.implementations.filter((i) => i.status === "implemented").length
}

export function eipImplementationStats(profile: CoinEipProfile) {
  let implemented = 0
  let partial = 0
  let notImplemented = 0
  let unknown = 0
  let alternative = 0
  for (const i of profile.implementations) {
    if (i.status === "implemented") implemented++
    else if (i.status === "partial") partial++
    else if (i.status === "not-implemented") notImplemented++
    else if (i.status === "alternative") alternative++
    else unknown++
  }
  return {
    implemented,
    partial,
    notImplemented,
    unknown,
    alternative,
    total: profile.implementations.length,
  }
}
