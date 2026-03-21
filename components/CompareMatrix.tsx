import type { Coin } from "@/types"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

function coinHasFeatureName(coin: Coin, name: string): boolean {
  return coin.features.some((f) => f.name === name)
}

export function CompareMatrix({ coins }: { coins: Coin[] }) {
  const active = coins.filter(Boolean).slice(0, 4)
  if (active.length === 0) return null

  const nameSet = new Set<string>()
  for (const c of active) {
    for (const f of c.features) {
      nameSet.add(f.name)
    }
  }
  const rows = Array.from(nameSet).sort((a, b) => a.localeCompare(b))

  const rowPattern = (name: string) => {
    const hits = active.map((c) => coinHasFeatureName(c, name))
    const allSame = hits.every((h) => h === hits[0])
    return { hits, highlight: !allSame && hits.some(Boolean) }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="sticky left-0 z-10 bg-muted/90 px-3 py-2 text-left font-medium backdrop-blur">
              Feature
            </th>
            {active.map((c) => (
              <th
                key={c.symbol}
                className="px-3 py-2 text-center font-mono font-medium"
              >
                {c.symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowName) => {
            const { hits, highlight } = rowPattern(rowName)
            return (
              <tr
                key={rowName}
                className={cn(
                  "border-b border-border/70 last:border-0",
                  highlight && "bg-amber-500/5"
                )}
              >
                <td className="bg-background sticky left-0 z-10 px-3 py-2 font-medium">
                  {rowName}
                </td>
                {hits.map((ok, i) => (
                  <td key={active[i].symbol} className="px-3 py-2 text-center">
                    {ok ? (
                      <Check className="text-primary mx-auto size-4" aria-label="Yes" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
