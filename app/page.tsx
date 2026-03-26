import { coins } from "@/data/coins"
import { HomeClient } from "@/components/HomeClient"
import { getAllChainSlugs } from "@/lib/chains"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"
import { getTotalMarketCap, getDataFreshness, isDynamic } from "@/lib/market-data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export default function HomePage() {
  const networkCount = getAllChainSlugs().length
  const freshness = getDataFreshness()
  const dynamic = isDynamic()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stablecoins</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Ranked reference for the top stablecoins by market cap: networks, contracts,
          features, and risk factors for integration work.
        </p>
      </div>

      <section
        className="grid gap-3 rounded-xl border border-border bg-card/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Site statistics"
      >
        <Stat label="Total market cap" value={getTotalMarketCap()} />
        <Stat label="Coins tracked" value={String(coins.length)} />
        <Stat label="Networks covered" value={`${networkCount}+`} />
        <Stat
          label="Data"
          value={dynamic ? "Hybrid / Daily" : "Static"}
          hint={dynamic ? `Market data refreshed ${freshness}` : "No live feeds"}
        />
      </section>

      <HomeClient coins={coins} />
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="text-muted-foreground mt-0.5 text-xs">{hint}</div> : null}
    </div>
  )
}
