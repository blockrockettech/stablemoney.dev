import Link from "next/link"
import type { Coin, StablecoinType } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NetworkChip } from "@/components/NetworkChip"
import { cn } from "@/lib/utils"
import { countImplementedEips } from "@/lib/eip-helpers"

const typeLabel: Record<StablecoinType, string> = {
  fiat: "Fiat-backed",
  crypto: "Crypto-backed",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
}

export function CoinCard({
  coin,
  className,
  asLink = true,
}: {
  coin: Coin
  className?: string
  /** Set false when the card is wrapped by another interactive element (e.g. search results). */
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
        "h-full transition-[box-shadow,transform]",
        asLink && "hover:-translate-y-px hover:shadow-md"
      )}
    >
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              #{coin.rank}
            </Badge>
            <span className="font-mono text-lg font-semibold tracking-tight">
              {coin.symbol}
            </span>
          </div>
          <Badge variant="outline" className="text-[0.65rem] uppercase">
            {typeLabel[coin.type]}
          </Badge>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="text-base font-medium leading-tight">{coin.name}</div>
          <div className="text-muted-foreground text-sm">{coin.issuer}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>
            <span className="text-foreground font-medium">MCap</span> {coin.marketCap}
          </span>
          <span>
            <span className="text-foreground font-medium">Networks</span>{" "}
            {coin.networks.length}
          </span>
          {eipImplemented != null ? (
            <Badge
              variant="secondary"
              className="font-mono text-[0.65rem]"
              title="EIP/ERC standards marked implemented in StableMoney.Dev profile"
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
