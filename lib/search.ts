import Fuse from "fuse.js"
import { coins } from "@/data/coins"
import type { Coin } from "@/types"
import { sortCoinsByMarketCap } from "@/lib/market-data"

type SearchRecord = {
  symbol: string
  name: string
  issuer: string
  features: string
  technicalNotes: string
  chains: string
}

function flattenCoin(c: Coin): SearchRecord {
  return {
    symbol: c.symbol,
    name: c.name,
    issuer: c.issuer,
    features: c.features.map((f) => `${f.name} ${f.description}`).join(" "),
    technicalNotes: c.technicalNotes,
    chains: c.networks.map((n) => `${n.chain} ${n.name}`).join(" "),
  }
}

const fuse = new Fuse(coins.map(flattenCoin), {
  keys: [
    { name: "symbol", weight: 0.35 },
    { name: "name", weight: 0.25 },
    { name: "issuer", weight: 0.15 },
    { name: "features", weight: 0.15 },
    { name: "technicalNotes", weight: 0.05 },
    { name: "chains", weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
})

export function searchCoins(query: string): Coin[] {
  const q = query.trim()
  if (!q) return sortCoinsByMarketCap([...coins])

  const results = fuse.search(q)
  return results
    .map((r) => coins.find((c) => c.symbol === r.item.symbol))
    .filter((c): c is Coin => Boolean(c))
}
