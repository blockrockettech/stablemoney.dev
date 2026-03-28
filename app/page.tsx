import Link from "next/link"
import Image from "next/image"
import { coins } from "@/data/coins"
import { HomeClient } from "@/components/HomeClient"
import { getAllChainSlugs } from "@/lib/chains"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site"
import { getTotalMarketCap, getDataFreshness, isDynamic } from "@/lib/market-data"
import { ArrowRight } from "lucide-react"
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
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/[0.07] blur-2xl" />

        <div className="relative space-y-4">
          <div className="flex items-center gap-3.5">
            <Image
              src="/favicon.svg"
              alt=""
              width={44}
              height={44}
              className="rounded-lg"
              aria-hidden="true"
            />
            <h1 className="flex items-baseline gap-2 font-mono tracking-tight">
              <span className="text-4xl font-bold text-primary sm:text-5xl">Stable</span>
              <span className="text-4xl font-bold text-foreground sm:text-5xl">Money</span>
              <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">.dev</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            {SITE_TAGLINE} — networks, contracts, EIP standards, compliance, and risk factors.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total market cap"
            value={getTotalMarketCap()}
            accent
          />
          <StatCard label="Coins tracked" value={String(coins.length)} />
          <StatCard label="Networks covered" value={`${networkCount}+`} />
          <StatCard
            label="Data"
            value={dynamic ? "Hybrid / Daily" : "Static"}
            hint={dynamic ? `Refreshed ${freshness}` : "No live feeds"}
          />
        </div>
      </section>

      {/* Standards callout */}
      <Link
        href="/standards"
        className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-5 py-4 transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm"
      >
        <div>
          <div className="text-sm font-semibold">EIP/ERC Standards & Compliance Matrix</div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            Compare ERC-20, permit, proxy patterns, compliance rules and flash loan support plus more across
            all {coins.length} stablecoins
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>

      <HomeClient coins={coins} />
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-card/80 px-4 py-3 backdrop-blur ${
        accent
          ? "border-primary/30 shadow-sm shadow-primary/5"
          : "border-border/60"
      }`}
    >
      <div className="text-muted-foreground text-[0.65rem] font-semibold tracking-wider uppercase">
        {label}
      </div>
      <div
        className={`mt-1 font-semibold tabular-nums ${
          accent ? "text-2xl text-primary" : "text-xl"
        }`}
      >
        {value}
      </div>
      {hint ? (
        <div className="text-muted-foreground mt-0.5 text-[0.65rem]">{hint}</div>
      ) : null}
    </div>
  )
}
