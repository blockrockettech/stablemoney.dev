import type { Eip, EipCategory } from "@/types/eip"
import { EIP_CATEGORY_TITLES } from "@/data/coinEips"
import { COIN_EIP_SYMBOLS, eipAnchorId, eipExternalLinks, getEipImplementation } from "@/lib/crypto/eip-helpers"
import { EipCard } from "@/components/EipCard"

const placeholderLabel: Record<string, { text: string; accent: string }> = {
  "not-implemented": {
    text: "Not implemented",
    accent: "text-red-400",
  },
  unknown: {
    text: "Unknown / not verified",
    accent: "text-muted-foreground",
  },
}

function PlaceholderCell({
  symbol,
  eipId,
  status,
}: {
  symbol: string
  eipId: string
  status: "not-implemented" | "unknown"
}) {
  const style = placeholderLabel[status]
  return (
    <div className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm">
      <span className="font-mono font-semibold text-foreground">{symbol}</span>
      <p className="mt-2 text-xs leading-relaxed">
        <span className={`font-medium ${style.accent}`}>{style.text}</span> for {eipId}.
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
      {eips.map((eip) => {
        const external = eipExternalLinks(eip.id)
        return (
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
                {(eip.eipsUrl || external) ? (
                  <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1">
                    {eip.eipsUrl && (
                      <a href={eip.eipsUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline">
                        eips.ethereum.org →
                      </a>
                    )}
                    {external && (
                      <>
                        <a href={external.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline">
                          GitHub →
                        </a>
                        <a href={external.eipToolsUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline">
                          eip.tools →
                        </a>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{eip.summary}</p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              {COIN_EIP_SYMBOLS.map((sym) => {
                const impl = getEipImplementation(sym, eip.id)
                if (!impl || impl.status === "not-implemented" || impl.status === "unknown") {
                  const status: "not-implemented" | "unknown" =
                    impl?.status === "not-implemented" ? "not-implemented" : "unknown"
                  return <PlaceholderCell key={sym} symbol={sym} eipId={eip.id} status={status} />
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
        )
      })}
    </section>
  )
}
