import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { coinBySymbol, coins } from "@/data/coins"
import type { StablecoinType } from "@/types"
import { loadCoinMdx } from "@/lib/mdx"
import { mergeCoinFeatures } from "@/lib/merge-features"
import { CoinMdx } from "@/components/CoinMdx"
import { ContractTable } from "@/components/ContractTable"
import { FeatureTable } from "@/components/FeatureTable"
import { RiskBadge } from "@/components/RiskBadge"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink } from "lucide-react"

const typeLabel: Record<StablecoinType, string> = {
  fiat: "Fiat-backed",
  crypto: "Crypto-backed",
  synthetic: "Synthetic",
  hybrid: "Hybrid",
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
  return {
    title,
    description,
    openGraph: {
      title,
      description: coin.description.slice(0, 200),
      type: "article",
    },
    twitter: {
      card: "summary",
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

  return (
    <article className="space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight">
            {coin.symbol}
          </span>
          <Badge variant="outline" className="text-xs uppercase">
            {typeLabel[coin.type]}
          </Badge>
          <span className="text-muted-foreground text-sm">Rank #{coin.rank}</span>
        </div>
        <h1 className="text-2xl font-semibold">{coin.name}</h1>
        <p className="text-muted-foreground text-sm">{coin.issuer}</p>
        <p className="text-muted-foreground text-sm">
          Market cap (static):{" "}
          <span className="text-foreground font-medium">{coin.marketCap}</span>
        </p>
        <p className="pt-1">
          <Link
            href={`/coins/${coin.symbol.toLowerCase()}/eips`}
            className="text-primary text-sm font-medium hover:underline"
          >
            EIP standards (ERC-20, permit, proxies…)
          </Link>
        </p>
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
        <h2 className="mb-3 text-lg font-semibold">Technical notes</h2>
        <pre className="font-mono text-muted-foreground overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed whitespace-pre-wrap">
          {coin.technicalNotes}
        </pre>
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
