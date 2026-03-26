"use client"

import type { StablecoinType } from "@/types"
import { cn } from "@/lib/utils"

const options: { value: "all" | StablecoinType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fiat", label: "Fiat-backed" },
  { value: "crypto", label: "Crypto-backed" },
  { value: "synthetic", label: "Synthetic" },
]

export function FilterBar({
  value,
  onChange,
  className,
}: {
  value: "all" | StablecoinType
  onChange: (v: "all" | StablecoinType) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1",
        className
      )}
      role="tablist"
      aria-label="Filter by collateral type"
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
