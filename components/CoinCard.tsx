import Link from "next/link"
import type { Coin, StablecoinType } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NetworkChip } from "@/components/NetworkChip"
import { cn } from "@/lib/utils"
import { countImplementedEips } from "@/lib/eip-helpers"
import { getMarketCap } from "@/lib/market-data"

const typeLabel: Record<StablecoinType, string> = {
  fiat: "Fiat-backed",
  crypto: "Crypto-backed",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
}

const typeAccent: Record<StablecoinType, string> = {
  fiat: "border-l-emerald-500/60",
  crypto: "border-l-violet-500/60",
  synthetic: "border-l-amber-500/60",
  hybrid: "border-l-sky-500/60",
}

function rankClass(rank: number): string {
  if (rank === 1) return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
  if (rank === 2) return "bg-slate-300/25 text-slate-600 dark:text-slate-300 border-slate-400/40"
  if (rank === 3) return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
  return "bg-secondary text-secondary-foreground border-transparent"
}

export function CoinCard({
  coin,
  marketCapRank,
  className,
  asLink = true,
}: {
  coin: Coin
  /** 1-based rank by live market cap (DefiLlama at build time) */
  marketCapRank: number
  className?: string
  asLink?: boolean
}) {
  const topNetworks = [...coin.networks]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .slice(0, 3)

  const eipImplemented = countImplementedEips(coin.symbol)

  const card = (
    <Card
      size="sm"
      className={cn(
        "h-full border-l-[3px] transition-all duration-200",
        typeAccent[coin.type],
        asLink && "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-l-primary/60"
      )}
    >
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("font-mono text-xs font-bold border", rankClass(marketCapRank))}
            >
              #{marketCapRank}
            </Badge>
            <span className="font-mono text-lg font-bold tracking-tight">
              {coin.symbol}
            </span>
          </div>
          <Badge variant="outline" className="text-[0.6rem] uppercase tracking-wider">
            {typeLabel[coin.type]}
          </Badge>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="text-base font-medium leading-tight">{coin.name}</div>
          <div className="text-muted-foreground text-sm">{coin.issuer}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-lg font-bold tabular-nums tracking-tight text-primary">
            {getMarketCap(coin.symbol)}
          </span>
          <span className="text-muted-foreground text-sm">
            <span className="text-foreground/80 font-medium">{coin.networks.length}</span>{" "}
            {coin.networks.length === 1 ? "chain" : "chains"}{" "}
            <span className="text-muted-foreground/80">listed</span>
          </span>
          {eipImplemented != null ? (
            <Badge
              variant="secondary"
              className="font-mono text-[0.6rem]"
              title="EIP/ERC standards marked implemented"
            >
              {eipImplemented} EIPs
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topNetworks.map((n) => (
            <NetworkChip
              key={`${n.chain}-${n.name}`}
              name={n.name}
              isPrimary={n.isPrimary}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (!asLink) {
    return <div className={cn("block", className)}>{card}</div>
  }

  return (
    <Link
      href={`/coins/${coin.symbol.toLowerCase()}`}
      className={cn("block", className)}
    >
      {card}
    </Link>
  )
}
