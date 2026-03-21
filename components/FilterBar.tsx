"use client"

import type { StablecoinType } from "@/types"
import { cn } from "@/lib/utils"

const options: { value: "all" | StablecoinType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fiat", label: "Fiat-backed" },
  { value: "crypto", label: "Crypto-backed" },
  { value: "synthetic", label: "Synthetic" },
  { value: "hybrid", label: "Hybrid" },
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
        "flex flex-wrap gap-2 rounded-lg border border-border bg-card/40 p-1",
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
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
