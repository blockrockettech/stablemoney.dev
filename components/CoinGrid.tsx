import type { Coin } from "@/types"
import { CoinCard } from "@/components/CoinCard"
import { getMarketCapRank, sortCoinsByMarketCap } from "@/lib/market-data"
import { cn } from "@/lib/utils"

export function CoinGrid({ coins, className }: { coins: Coin[]; className?: string }) {
  const sorted = sortCoinsByMarketCap(coins)
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className
      )}
    >
      {sorted.map((c) => (
        <CoinCard key={c.symbol} coin={c} marketCapRank={getMarketCapRank(c.symbol)} />
      ))}
    </div>
  )
}
