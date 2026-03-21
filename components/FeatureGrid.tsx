import type { Feature } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categoryTint: Record<Feature["category"], string> = {
  authorization: "border-blue-500/25 bg-blue-500/5",
  "cross-chain": "border-violet-500/25 bg-violet-500/5",
  compliance: "border-amber-500/25 bg-amber-500/5",
  yield: "border-emerald-500/25 bg-emerald-500/5",
  governance: "border-rose-500/25 bg-rose-500/5",
  stability: "border-cyan-500/25 bg-cyan-500/5",
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  const byCategory = features.reduce(
    (acc, f) => {
      acc[f.category] = acc[f.category] ?? []
      acc[f.category].push(f)
      return acc
    },
    {} as Record<Feature["category"], Feature[]>
  )

  const order: Feature["category"][] = [
    "authorization",
    "cross-chain",
    "compliance",
    "yield",
    "governance",
    "stability",
  ]

  return (
    <div className="space-y-8">
      {order.map((cat) => {
        const list = byCategory[cat]
        if (!list?.length) return null
        return (
          <section key={cat}>
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
              {cat.replace("-", " ")}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((f) => (
                <div
                  key={f.name}
                  className={cn("rounded-lg border p-4", categoryTint[cat])}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{f.name}</span>
                    {f.eip ? (
                      <Badge variant="outline" className="font-mono text-[0.65rem]">
                        {f.eip}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
