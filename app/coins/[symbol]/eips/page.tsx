import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { coinBySymbol, coins } from "@/data/coins"
import { EIPS } from "@/data/eips"
import type { EipCategory } from "@/types/eip"
import {
  eipImplementationStats,
  getCoinEipProfile,
} from "@/lib/eip-helpers"
import { EipCard } from "@/components/EipCard"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

const CATEGORY_ORDER: EipCategory[] = [
  "core",
  "signature",
  "upgradeability",
  "vault",
  "compliance",
  "cross-chain",
  "flash",
]

export function generateStaticParams() {
  return coins.map((c) => ({ symbol: c.symbol.toLowerCase() }))
}

export async function generateMetadata({
  params,
}: {
  params: { symbol: string }
}): Promise<Metadata> {
  const coin = coinBySymbol[params.symbol.toUpperCase()]
  if (!coin) return {}
  const title = `${coin.symbol} — EIP / ERC standards`
  return {
    title,
    description: `Technical ERC and EIP implementation notes for ${coin.name} (${coin.symbol}).`,
  }
}

export default function CoinEipsPage({ params }: { params: { symbol: string } }) {
  const coin = coinBySymbol[params.symbol.toUpperCase()]
  if (!coin) notFound()

  const profile = getCoinEipProfile(coin.symbol)
  const symLower = coin.symbol.toLowerCase()

  if (!profile) {
    return (
      <div className="space-y-6">
        <Link
          href={`/coins/${symLower}`}
          className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to {coin.symbol}
        </Link>
        <div className="rounded-lg border border-border bg-muted/20 p-6">
          <h1 className="text-xl font-semibold">EIP standards — {coin.symbol}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            StableMoney.Dev does not yet have a curated EIP profile for this token. See the global
            standards reference for the methodology and covered assets.
          </p>
          <Link
            href="/standards"
            className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
          >
            Open ERC / EIP standards reference →
          </Link>
        </div>
      </div>
    )
  }

  const stats = eipImplementationStats(profile)

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/coins/${symLower}`}
          className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to {coin.symbol}
        </Link>
      </div>

      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xl font-bold">{coin.symbol}</span>
          <Badge variant="outline">EIP / ERC</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Standards implementation</h1>
        <div className="bg-muted/40 rounded-lg border border-border px-4 py-3 text-sm">
          <p>
            <span className="text-muted-foreground">Contract focus:</span>{" "}
            <span className="font-medium">{profile.contractName}</span>
          </p>
          {profile.deployedBlock != null ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Reference deployment block (Ethereum): {profile.deployedBlock.toLocaleString()}
            </p>
          ) : null}
          <p className="mt-2">
            <span className="text-muted-foreground">Upgradeable:</span>{" "}
            <span className="font-medium">{profile.isUpgradeable ? "Yes" : "No"}</span>
            {profile.upgradePattern ? (
              <>
                {" "}
                <span className="text-muted-foreground">·</span>{" "}
                <span className="font-medium">{profile.upgradePattern}</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Implementation counts"
      >
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Implemented</div>
          <div className="font-mono text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
            {stats.implemented}
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Partial</div>
          <div className="font-mono text-2xl font-semibold text-amber-900 dark:text-amber-200">
            {stats.partial}
          </div>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Not implemented</div>
          <div className="font-mono text-2xl font-semibold text-red-900 dark:text-red-200">
            {stats.notImplemented}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Unknown</div>
          <div className="font-mono text-2xl font-semibold">{stats.unknown}</div>
        </div>
      </section>

      {CATEGORY_ORDER.map((category) => {
        const eipsInCat = EIPS.filter((e) => e.category === category)
        const withImpl = eipsInCat.filter((e) =>
          profile.implementations.some((i) => i.eipId === e.id),
        )
        if (!withImpl.length) return null

        return (
          <section key={category} className="space-y-4">
            <h2 className="text-lg font-semibold capitalize tracking-tight">{category}</h2>
            <div className="space-y-3">
              {withImpl.map((eip) => {
                const impl = profile.implementations.find((i) => i.eipId === eip.id)
                if (!impl) return null
                return <EipCard key={eip.id} eip={eip} impl={impl} defaultOpen={false} />
              })}
            </div>
          </section>
        )
      })}

      <p className="text-muted-foreground text-sm">
        Cross-coin comparison:{" "}
        <Link href="/standards" className="text-primary font-medium hover:underline">
          ERC / EIP standards reference
        </Link>
      </p>
    </div>
  )
}
