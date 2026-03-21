import type { Eip, EipCategory } from "@/types/eip"
import { COIN_EIP_SYMBOLS, eipAnchorId, getEipImplementation } from "@/lib/eip-helpers"
import { EipCard } from "@/components/EipCard"

const categoryTitles: Record<EipCategory, string> = {
  core: "Core",
  signature: "Signatures & typed data",
  upgradeability: "Upgradeability & proxies",
  vault: "Vaults & yield",
  compliance: "Compliance",
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
      <h2 className="text-xl font-semibold tracking-tight">{categoryTitles[category]}</h2>
      {eips.map((eip) => (
        <div
          key={eip.id}
          id={eipAnchorId(eip.id)}
          className="scroll-mt-24 space-y-4 border-b border-border/60 pb-10 last:border-0 last:pb-0"
        >
          <div>
            <h3 className="font-mono text-lg font-semibold">{eip.id}</h3>
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
              {eip.summary}
            </p>
            {eip.eipsUrl ? (
              <a
                href={eip.eipsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-2 inline-block text-xs font-medium hover:underline"
              >
                Official EIP text →
              </a>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {COIN_EIP_SYMBOLS.map((sym) => {
              const impl = getEipImplementation(sym, eip.id)
              if (!impl) {
                return (
                  <div
                    key={sym}
                    className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm"
                  >
                    <span className="font-mono font-semibold text-foreground">{sym}</span>
                    <p className="mt-2 text-xs leading-relaxed">
                      No entry in this profile for {eip.id}. For matrix purposes this is treated as{" "}
                      <span className="text-foreground font-medium">not implemented</span> unless
                      you verify on-chain.
                    </p>
                  </div>
                )
              }
              return <EipCard key={sym} eip={eip} impl={impl} coinSymbol={sym} />
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
