import type { Eip, EipCategory } from "@/types/eip"
import { EIP_CATEGORY_TITLES } from "@/data/eips"
import { COIN_EIP_SYMBOLS, eipAnchorId, getEipImplementation } from "@/lib/eip-helpers"
import { EipCard } from "@/components/EipCard"

function NotImplementedCell({ symbol, eipId }: { symbol: string; eipId: string }) {
  return (
    <div className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm">
      <span className="font-mono font-semibold text-foreground">{symbol}</span>
      <p className="mt-2 text-xs leading-relaxed">
        <span className="text-foreground font-medium">Not implemented</span> for {eipId}. Same as
        an empty profile row unless you verify this deployment on-chain.
      </p>
    </div>
  )
}

export function EipCategorySection({
  category,
  eips,
}: {
  category: EipCategory
  eips: Eip[]
}) {
  if (!eips.length) return null

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-semibold tracking-tight">{EIP_CATEGORY_TITLES[category]}</h2>
      {eips.map((eip) => (
        <div
          key={eip.id}
          id={eipAnchorId(eip.id)}
          className="scroll-mt-24 space-y-4 border-b border-border/60 pb-10 last:border-0 last:pb-0"
        >
          <header className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                <span className="font-mono">{eip.id}</span>
                <span className="text-muted-foreground font-sans font-normal">
                  {" "}
                  — {eip.name}
                </span>
              </h3>
              {eip.eipsUrl ? (
                <a
                  href={eip.eipsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary shrink-0 text-xs font-medium hover:underline"
                >
                  eips.ethereum.org →
                </a>
              ) : null}
            </div>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{eip.summary}</p>
          </header>

          <div className="grid gap-4 lg:grid-cols-2">
            {COIN_EIP_SYMBOLS.map((sym) => {
              const impl = getEipImplementation(sym, eip.id)
              if (!impl || impl.status === "not-implemented") {
                return <NotImplementedCell key={sym} symbol={sym} eipId={eip.id} />
              }
              return (
                <EipCard
                  key={sym}
                  eip={eip}
                  impl={impl}
                  coinSymbol={sym}
                  suppressEipOverview
                />
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
