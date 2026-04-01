import Link from "next/link"
import Image from "next/image"
import { coins } from "@/data/coins"
import { HomeClient } from "@/components/HomeClient"
import { getAllChainSlugs } from "@/lib/crypto/chains"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/site/config"
import { getTotalMarketCap, getDataFreshness, isDynamic } from "@/lib/market-data/market-data"
import { ArrowRight, TableProperties } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Stablecoin Technical Reference for Engineers`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Stablecoin Technical Reference`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: `${SITE_NAME} — Stablecoin Technical Reference`,
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

      {/* Standards callout — primary secondary CTA */}
      <Link
        href="/standards"
        className="group relative block overflow-hidden rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card shadow-md shadow-primary/[0.06] ring-1 ring-primary/10 transition-all hover:border-primary/45 hover:shadow-lg hover:shadow-primary/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/[0.14] blur-3xl transition-opacity group-hover:opacity-100" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 text-primary shadow-inner shadow-primary/5"
              aria-hidden
            >
              <TableProperties className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-2">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.14em]">
                Technical deep dive
              </p>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                EIP/ERC standards & compliance matrix
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
                Side-by-side comparison of ERC-20, permit, proxy patterns, compliance hooks, flash loans,
                and more — across all {coins.length} stablecoins on the site.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors group-hover:bg-primary/15">
              Open the matrix
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
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
