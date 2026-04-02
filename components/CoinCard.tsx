import Link from "next/link"
import type { Coin, StablecoinType } from "@/types"
import { STABLECOIN_TYPE_LABEL } from "@/data/stablecoin-taxonomy"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NetworkChip } from "@/components/NetworkChip"
import { cn } from "@/lib/utils"
import { countImplementedEips } from "@/lib/crypto/eip-helpers"
import { getMarketCap } from "@/lib/market-data/market-data"

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
      {/* ── Header: rank · symbol · type ───────────────── */}
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("shrink-0 font-mono text-xs font-bold border", rankClass(marketCapRank))}
            >
              #{marketCapRank}
            </Badge>
            <span className="font-mono text-lg font-bold tracking-tight">
              {coin.symbol}
            </span>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.6rem] uppercase tracking-wider">
            {STABLECOIN_TYPE_LABEL[coin.type]}
          </Badge>
        </div>

        {/* Name + issuer — each clamped to one line so all headers are the same height */}
        <div className="mt-2 space-y-0.5">
          <div className="line-clamp-1 text-base font-medium leading-tight">{coin.name}</div>
          <div className="text-muted-foreground line-clamp-1 text-sm">{coin.issuer}</div>
        </div>
      </CardHeader>

      {/* ── Body ───────────────────────────────────────── */}
      <CardContent className="space-y-3 pt-3">
        {/* Market cap left, chain/EIP counts right — never wraps */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold tabular-nums tracking-tight text-primary">
            {getMarketCap(coin.symbol)}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            {coin.networks.length} {coin.networks.length === 1 ? "chain" : "chains"}
            {eipImplemented != null && (
              <span className="text-muted-foreground/70"> · {eipImplemented} EIPs</span>
            )}
          </span>
        </div>

        {/* Network chips — min-h keeps this row the same height even with fewer chips */}
        <div className="flex min-h-[24px] flex-wrap gap-1.5">
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
