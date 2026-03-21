import type { RiskLevel } from "@/types"
import { cn } from "@/lib/utils"

const levelClass: Record<RiskLevel, string> = {
  high: "bg-red-500/15 text-red-700 ring-1 ring-red-500/30 dark:text-red-300",
  medium: "bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/35 dark:text-amber-200",
  low: "bg-emerald-500/12 text-emerald-800 ring-1 ring-emerald-500/30 dark:text-emerald-200",
}

export function RiskBadge({
  label,
  level,
  className,
}: {
  label: string
  level: RiskLevel
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        levelClass[level],
        className
      )}
    >
      <span className="text-muted-foreground mr-1.5 capitalize">{level}</span>
      {label}
    </span>
  )
}
