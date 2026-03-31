import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { coinBySymbol, coins } from "@/data/coins"
import { EIPS, EIP_CATEGORY_ORDER, EIP_CATEGORY_TITLES } from "@/data/coinEips"
import {
  eipImplementationStats,
  getCoinEipProfile,
} from "@/lib/crypto/eip-helpers"
import { EipCard } from "@/components/EipCard"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { shortAddress } from "@/lib/crypto/address-utils"
import { SITE_CANONICAL_URL } from "@/site/config"

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
  const title = `${coin.symbol} — EIP / ERC Standards`
  const description = `ERC-20, EIP-712, EIP-2612, proxy, compliance, and flash loan implementation notes for ${coin.name} (${coin.symbol}).`
  const canonicalUrl = `${SITE_CANONICAL_URL}/coins/${params.symbol.toLowerCase()}/eips`
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

const placeholderAccent: Record<string, string> = {
  "not-implemented": "text-red-400",
  unknown: "text-muted-foreground",
}

function PlaceholderCard({
  eipId,
  eipName,
  status,
}: {
  eipId: string
  eipName: string
  status: "not-implemented" | "unknown"
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono font-semibold">{eipId}</span>
        <span className="text-muted-foreground">— {eipName}</span>
      </div>
      <p className="mt-1.5 text-xs">
        <span className={`font-medium ${placeholderAccent[status]}`}>
          {status === "not-implemented" ? "Not implemented" : "Unknown / not verified"}
        </span>
      </p>
    </div>
  )
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stablemoney.dev" },
      {
        "@type": "ListItem",
        position: 2,
        name: coin.symbol,
        item: `https://stablemoney.dev/coins/${symLower}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "EIP / ERC Standards",
        item: `https://stablemoney.dev/coins/${symLower}/eips`,
      },
    ],
  }

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
            <span className="text-muted-foreground">Contract assessed:</span>{" "}
            <span className="font-medium">{profile.contractName}</span>
          </p>
          {profile.contractAddress ? (
            <p className="mt-1">
              <span className="text-muted-foreground">Address:</span>{" "}
              <a
                href={`https://etherscan.io/address/${profile.contractAddress}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 font-mono text-xs font-medium hover:underline"
              >
                {shortAddress(profile.contractAddress)}
                <ExternalLink className="size-3" />
              </a>
              <span className="text-muted-foreground ml-2 text-xs">(Ethereum mainnet · verified source)</span>
            </p>
          ) : null}
          {coin.githubUrl ? (
            <p className="mt-1">
              <span className="text-muted-foreground">Source repo:</span>{" "}
              <a
                href={coin.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
              >
                {coin.githubUrl.replace("https://github.com/", "")}
                <ExternalLink className="size-3" />
              </a>
            </p>
          ) : null}
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
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Implementation counts"
      >
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Implemented</div>
          <div className="font-mono text-2xl font-semibold text-emerald-200">
            {stats.implemented}
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Partial</div>
          <div className="font-mono text-2xl font-semibold text-amber-200">
            {stats.partial}
          </div>
        </div>
        {stats.alternative > 0 && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 px-4 py-3">
            <div className="text-muted-foreground text-xs font-medium uppercase">Alternative</div>
            <div className="font-mono text-2xl font-semibold text-violet-200">
              {stats.alternative}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <div className="text-muted-foreground text-xs font-medium uppercase">Not implemented</div>
          <div className="font-mono text-2xl font-semibold text-red-200">
            {stats.notImplemented}
          </div>
        </div>
        {stats.unknown > 0 && (
          <div className="rounded-lg border border-slate-500/30 bg-slate-500/5 px-4 py-3">
            <div className="text-muted-foreground text-xs font-medium uppercase">Unknown</div>
            <div className="font-mono text-2xl font-semibold">{stats.unknown}</div>
          </div>
        )}
      </section>

      {EIP_CATEGORY_ORDER.map((category) => {
        const eipsInCat = EIPS.filter((e) => e.category === category)
        if (!eipsInCat.length) return null

        return (
          <section key={category} className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">{EIP_CATEGORY_TITLES[category]}</h2>
            <div className="space-y-3">
              {eipsInCat.map((eip) => {
                const impl = profile.implementations.find((i) => i.eipId === eip.id)
                if (impl) {
                  return <EipCard key={eip.id} eip={eip} impl={impl} defaultOpen={false} />
                }
                return (
                  <PlaceholderCard key={eip.id} eipId={eip.id} eipName={eip.name} status="unknown" />
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
        Data sourced from verified Etherscan contract source code. Implementations may differ across
        networks — always verify on the specific chain you integrate with.
      </div>

      <p className="text-muted-foreground text-sm">
        Cross-coin comparison:{" "}
        <Link href="/standards" className="text-primary font-medium hover:underline">
          ERC / EIP standards reference
        </Link>
      </p>
    </div>
  )
}
