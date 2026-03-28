import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"

const API_URL = "https://stablecoins.llama.fi/stablecoins?includePrices=true"

const SYMBOL_TO_DEFILLAMA_ID: Record<string, string> = {
  USDT: "1",
  USDC: "2",
  USDS: "209",
  USDe: "146",
  DAI: "5",
  USD1: "262",
  RLUSD: "250",
  GHO: "118",
  PYUSD: "120",
  TUSD: "7",
  FDUSD: "119",
  frxUSD: "235",
}

interface DefiLlamaAsset {
  id: string
  symbol: string
  name: string
  circulating?: { peggedUSD?: number }
  chains?: string[]
  price?: number
}

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

const OUTPUT_PATH = join(
  dirname(new URL(import.meta.url).pathname),
  "..",
  "data",
  "generated",
  "market-data.json",
)

async function fetchMarketData(): Promise<MarketDataFile> {
  console.log("[fetch-market-data] Fetching from DefiLlama…")
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`DefiLlama returned ${res.status}`)

  const data = (await res.json()) as { peggedAssets: DefiLlamaAsset[] }
  const byId = new Map<string, DefiLlamaAsset>()
  for (const asset of data.peggedAssets) {
    byId.set(asset.id, asset)
  }

  const coins: Record<string, MarketDataCoin> = {}
  let totalMarketCap = 0

  for (const [symbol, id] of Object.entries(SYMBOL_TO_DEFILLAMA_ID)) {
    const asset = byId.get(id)
    if (!asset) {
      console.warn(`[fetch-market-data] Warning: DefiLlama ID ${id} (${symbol}) not found`)
      continue
    }
    const mcap = asset.circulating?.peggedUSD ?? 0
    const chainCount = asset.chains?.length ?? 0
    const price = asset.price ?? 1

    coins[symbol] = { marketCap: mcap, chainCount, price }
    totalMarketCap += mcap
  }

  return {
    fetchedAt: new Date().toISOString(),
    totalMarketCap,
    coins,
  }
}

async function main() {
  try {
    const result = await fetchMarketData()
    const found = Object.keys(result.coins).length
    console.log(
      `[fetch-market-data] Got data for ${found}/${Object.keys(SYMBOL_TO_DEFILLAMA_ID).length} coins, total mcap $${(result.totalMarketCap / 1e9).toFixed(1)}B`,
    )

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n")
    console.log(`[fetch-market-data] Wrote ${OUTPUT_PATH}`)
  } catch (err) {
    console.error("[fetch-market-data] Fetch failed:", err)

    if (existsSync(OUTPUT_PATH)) {
      console.log("[fetch-market-data] Using existing cached file — build will proceed")
    } else {
      console.log("[fetch-market-data] No cached file — build will use static fallbacks from data/coins.ts")
      mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
      const fallback: MarketDataFile = {
        fetchedAt: new Date().toISOString(),
        totalMarketCap: 0,
        coins: {},
      }
      writeFileSync(OUTPUT_PATH, JSON.stringify(fallback, null, 2) + "\n")
    }
  }
}

main()
