import { COIN_EIP_PROFILES } from "@/data/coinEips"
import type { CoinEipImpl, CoinEipProfile, EipStatus } from "@/types/eip"

/** Column order for matrix and deep-dive sections (market-cap rank in static data) */
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

export function eipAnchorId(eipId: string): string {
  const m = /^(EIP|ERC)-(\d+)$/i.exec(eipId.trim())
  if (m) return `eip-${m[2]}`
  return eipId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getCoinEipProfile(symbol: string): CoinEipProfile | undefined {
  return COIN_EIP_PROFILES.find((p) => p.symbol === symbol)
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
