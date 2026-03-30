import { Fragment } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { coinBySymbol, coins } from "@/data/coins"
import type { StablecoinType } from "@/types"
import { loadCoinMdx } from "@/site/mdx"
import { mergeCoinFeatures } from "@/site/merge-features"
import { EIPS, EIP_CATEGORY_ORDER, EIP_CATEGORY_TITLES } from "@/data/eips"
import { eipAnchorId, getCellStatus, getCoinEipProfile, getEipImplementation } from "@/lib/crypto/eip-helpers"
import { shortAddress } from "@/lib/crypto/address-utils"
import type { EipStatus } from "@/types/eip"
import { CoinMdx } from "@/components/CoinMdx"
import { ContractTable } from "@/components/ContractTable"
import { FeatureTable } from "@/components/FeatureTable"
import { RiskBadge } from "@/components/RiskBadge"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ExternalLink } from "lucide-react"
import { getMarketCap, getMarketCapRank } from "@/lib/market-data/market-data"

const typeLabel: Record<StablecoinType, string> = {
  fiat: "Fiat-backed",
  crypto: "Crypto-backed",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
}

const statusBadgeClass: Record<EipStatus, string> = {
  implemented:
    "border-emerald-500/50 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  partial: "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200",
  "not-implemented": "border-red-500/50 bg-red-500/15 text-red-900 dark:text-red-200",
  unknown: "border-muted-foreground/40 bg-muted text-muted-foreground",
  alternative:
    "border-violet-500/50 bg-violet-500/15 text-violet-900 dark:text-violet-200",
}

const statusLabel: Record<EipStatus, string> = {
  implemented: "Implemented",
  partial: "Partial",
  "not-implemented": "Not implemented",
  unknown: "Unknown",
  alternative: "Alternative",
}

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
  const title = `${coin.symbol} — ${coin.name}`
  const description = coin.description.slice(0, 155)
  const canonicalUrl = `https://stablemoney.dev/coins/${params.symbol.toLowerCase()}`
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: coin.description.slice(0, 200),
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

export default async function CoinPage({ params }: { params: { symbol: string } }) {
  const coin = coinBySymbol[params.symbol.toUpperCase()]
  if (!coin) notFound()

  const mdx = await loadCoinMdx(coin.symbol)
  const featureRows = mergeCoinFeatures(coin)
  const mcapRank = getMarketCapRank(coin.symbol)

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stablemoney.dev" },
      {
        "@type": "ListItem",
        position: 2,
        name: coin.symbol,
        item: `https://stablemoney.dev/coins/${params.symbol.toLowerCase()}`,
      },
    ],
  }

  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="space-y-3 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight">
            {coin.symbol}
          </span>
          <Badge variant="outline" className="text-xs uppercase">
            {typeLabel[coin.type]}
          </Badge>
          <span className="text-muted-foreground text-sm">
            Rank #{mcapRank > 0 ? mcapRank : "—"}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{coin.name}</h1>
        <p className="text-muted-foreground text-sm">{coin.issuer}</p>
        <p className="text-muted-foreground text-sm">
          Market cap:{" "}
          <span className="text-foreground font-medium">{getMarketCap(coin.symbol)}</span>
        </p>
        <Link
          href={`/coins/${coin.symbol.toLowerCase()}/eips`}
          className="group mt-2 flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-5 py-4 transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm"
        >
          <div>
            <div className="text-sm font-semibold">EIP/ERC standards &amp; compliance</div>
            <div className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              Full {coin.symbol} profile: ERC-20, permit, proxy patterns, cross-chain, flash loans, and
              compliance EIPs — with implementation notes and verified contract context.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          {coin.description}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Features</h2>
        <FeatureTable coin={coin} features={featureRows} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">EIP / ERC support matrix</h2>
        <p className="text-muted-foreground mb-4 max-w-3xl text-sm leading-relaxed">
          Standards &amp; compliance support for {coin.symbol}. Click an EIP to jump to the global deep-dive section.
        </p>
        {(() => {
          const eipProfile = getCoinEipProfile(coin.symbol)
          if (!eipProfile?.contractAddress && !coin.githubUrl) return null
          return (
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {eipProfile?.contractAddress ? (
                <a
                  href={`https://etherscan.io/address/${eipProfile.contractAddress}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
                >
                  Verified contract: {shortAddress(eipProfile.contractAddress)}
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
              {coin.githubUrl ? (
                <a
                  href={coin.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
                >
                  Source: {coin.githubUrl.replace("https://github.com/", "")}
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          )
        })()}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th scope="col" className="px-3 py-2 font-medium">
                  Standard
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="min-w-[300px] px-3 py-2 font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {EIP_CATEGORY_ORDER.map((category) => {
                const eipsInCat = EIPS.filter((e) => e.category === category)
                if (!eipsInCat.length) return null
                return (
                  <Fragment key={category}>
                    <tr className="bg-muted/30">
                      <td
                        colSpan={3}
                        className="px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {EIP_CATEGORY_TITLES[category]}
                      </td>
                    </tr>
                    {eipsInCat.map((eip) => {
                      const status = getCellStatus(coin.symbol, eip.id)
                      const impl = getEipImplementation(coin.symbol, eip.id)
                      const notes = impl?.status === "alternative" && impl.alternativeStandard
                        ? `Via ${impl.alternativeStandard}: ${impl.alternativeNotes ?? impl.devImpact}`
                        : (impl?.devImpact ?? "—")
                      return (
                        <tr key={eip.id} className="border-b border-border/70 align-top last:border-0">
                          <td className="px-3 py-3">
                            <Link
                              href={`/standards#${eipAnchorId(eip.id)}`}
                              className="text-primary inline-flex items-center gap-2 font-mono text-xs font-semibold hover:underline"
                            >
                              {eip.id}
                            </Link>
                            <div className="text-muted-foreground mt-1 text-xs">{eip.name}</div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className={statusBadgeClass[status]}>
                              {statusLabel[status]}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground px-3 py-3 text-xs leading-relaxed">
                            {notes}
                          </td>
                        </tr>
                      )
                    })}
                  </Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td
                  colSpan={3}
                  className="px-3 py-2.5 text-center text-[0.7rem] leading-relaxed text-muted-foreground"
                >
                  Data sourced from verified Etherscan contract source code. Implementations may differ across
                  networks — always verify on the specific chain you integrate with.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Technical notes</h2>
        <ul className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
          {coin.technicalNotes
            .split(/\.\s+/)
            .filter((s) => s.trim().length > 0)
            .map((sentence, i) => {
              const text = sentence.replace(/\.?$/, ".")
              return (
                <li
                  key={i}
                  className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed"
                >
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden />
                  <span className="font-mono text-xs">{text}</span>
                </li>
              )
            })}
        </ul>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Reserves &amp; peg
          </h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Reserves</dt>
              <dd>{coin.reserves}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Collateral</dt>
              <dd>{coin.collateralType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Peg mechanism</dt>
              <dd>{coin.pegMechanism}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Auditor</dt>
              <dd>{coin.auditor}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Ecosystem</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">DeFi integration</dt>
              <dd>{coin.defiIntegration}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Yield</dt>
              <dd>{coin.yield}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Risk factors</h2>
        <div className="flex flex-wrap gap-2">
          {coin.risks.map((r) => (
            <RiskBadge key={r.label} label={r.label} level={r.level} />
          ))}
        </div>
      </section>

      {(coin.docsUrl || coin.githubUrl) && (
        <section className="flex flex-wrap gap-4">
          {coin.docsUrl ? (
            <Link
              href={coin.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              Official documentation
              <ExternalLink className="size-4" />
            </Link>
          ) : null}
          {coin.githubUrl ? (
            <Link
              href={coin.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              Official GitHub
              <ExternalLink className="size-4" />
            </Link>
          ) : null}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Networks &amp; contracts</h2>
        <p className="text-muted-foreground mb-4 max-w-3xl text-sm">
          Deployments by chain — primary rows are highlighted. Always verify addresses against issuer
          docs before mainnet integrations.
        </p>
        <ContractTable networks={coin.networks} />
      </section>

      {mdx ? (
        <>
          <Separator />
          <section>
            <h2 className="mb-4 text-lg font-semibold">Engineering deep dive</h2>
            <div className="max-w-3xl">
              <CoinMdx source={mdx} />
            </div>
          </section>
        </>
      ) : null}
    </article>
  )
}
