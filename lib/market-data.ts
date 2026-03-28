import { coinBySymbol, coins as allCoins } from "@/data/coins"

interface MarketDataCoin {
  marketCap: number
  chainCount: number
  price: number
}

interface MarketDataFile {
  fetchedAt: string
  totalMarketCap: number
  coins: Record<string, MarketDataCoin>
}

let _cache: MarketDataFile | null = null

function load(): MarketDataFile | null {
  if (_cache) return _cache
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require("@/data/generated/market-data.json") as MarketDataFile
    if (raw && raw.coins && Object.keys(raw.coins).length > 0) {
      _cache = raw
      return _cache
    }
  } catch {
    // generated file not present — fall back to static data
  }
  return null
}

function formatUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function getMarketCap(symbol: string): string {
  const data = load()
  const entry = data?.coins[symbol]
  if (entry && entry.marketCap > 0) return formatUsd(entry.marketCap)
  return coinBySymbol[symbol.toUpperCase()]?.marketCap ?? "N/A"
}

export function getChainCount(symbol: string): number {
  const data = load()
  const entry = data?.coins[symbol]
  if (entry && entry.chainCount > 0) return entry.chainCount
  return coinBySymbol[symbol.toUpperCase()]?.networks.length ?? 0
}

export function getTotalMarketCap(): string {
  const data = load()
  if (data && data.totalMarketCap > 0) return formatUsd(data.totalMarketCap)
  return "~$314B"
}

export function getDataFreshness(): string | null {
  const data = load()
  if (!data?.fetchedAt) return null
  try {
    return new Date(data.fetchedAt).toISOString().slice(0, 10)
  } catch {
    return null
  }
}

export function isDynamic(): boolean {
  const data = load()
  return data !== null && Object.keys(data.coins).length > 0
}

/** Raw market cap number for sorting — falls back to 0 if unavailable */
export function getMarketCapValue(symbol: string): number {
  const data = load()
  return data?.coins[symbol]?.marketCap ?? 0
}

/** Descending by live market cap; tie-breaker symbol for stable order when data is missing */
export function sortCoinsByMarketCap<T extends { symbol: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const mcapA = getMarketCapValue(a.symbol)
    const mcapB = getMarketCapValue(b.symbol)
    if (mcapA !== mcapB) return mcapB - mcapA
    return a.symbol.localeCompare(b.symbol)
  })
}

/** 1-based rank among all tracked coins by current market-cap data */
export function getMarketCapRank(symbol: string): number {
  const ordered = sortCoinsByMarketCap(allCoins)
  const i = ordered.findIndex((c) => c.symbol === symbol)
  return i >= 0 ? i + 1 : 0
}
