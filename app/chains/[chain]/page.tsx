import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getChainDisplayName, getAllChainSlugs, getCoinsOnChain } from "@/lib/chains"
import { ContractTable } from "@/components/ContractTable"
import { Badge } from "@/components/ui/badge"

export function generateStaticParams() {
  return getAllChainSlugs().map((chain) => ({ chain }))
}

export async function generateMetadata({
  params,
}: {
  params: { chain: string }
}): Promise<Metadata> {
  const slug = params.chain.toLowerCase()
  const chains = getAllChainSlugs()
  if (!chains.includes(slug)) return {}
  const name = getChainDisplayName(slug)
  const title = `${name} — deployments`
  return {
    title,
    description: `Stablecoins with deployments on ${name}: contracts and standards.`,
    openGraph: { title, description: `Stablecoin contracts on ${name}.` },
  }
}

export default function ChainPage({ params }: { params: { chain: string } }) {
  const slug = params.chain.toLowerCase()
  const all = getAllChainSlugs()
  if (!all.includes(slug)) notFound()

  const rows = getCoinsOnChain(slug)
  const name = getChainDisplayName(slug)

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Chain
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {slug}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          All tracked stablecoins that list a deployment on this network ({rows.length}{" "}
          {rows.length === 1 ? "entry" : "entries"}).
        </p>
      </header>

      <div className="space-y-10">
        {rows.map(({ coin, deployment }) => (
          <section key={coin.symbol} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                href={`/coins/${coin.symbol.toLowerCase()}`}
                className="text-lg font-semibold hover:underline"
              >
                {coin.symbol}{" "}
                <span className="text-muted-foreground font-normal">— {coin.name}</span>
              </Link>
            </div>
            <ContractTable networks={[deployment]} />
          </section>
        ))}
      </div>
    </div>
  )
}
