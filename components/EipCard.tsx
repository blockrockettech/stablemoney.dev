"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { CoinEipImpl, Eip, EipCategory, EipStatus } from "@/types/eip"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusStyles: Record<
  EipStatus,
  { badge: string; label: string }
> = {
  implemented: {
    badge:
      "border-emerald-500/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
    label: "Implemented",
  },
  partial: {
    badge: "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200",
    label: "Partial",
  },
  "not-implemented": {
    badge: "border-red-500/50 bg-red-500/15 text-red-900 dark:text-red-200",
    label: "Not implemented",
  },
  unknown: {
    badge: "border-muted-foreground/40 bg-muted text-muted-foreground",
    label: "Unknown",
  },
  alternative: {
    badge: "border-violet-500/50 bg-violet-500/15 text-violet-800 dark:text-violet-200",
    label: "Alternative",
  },
}

const categoryStyles: Record<EipCategory, string> = {
  core: "border-border bg-muted text-muted-foreground",
  signature: "border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  upgradeability:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  vault: "border-violet-500/40 bg-violet-500/10 text-violet-900 dark:text-violet-200",
  compliance: "border-orange-500/40 bg-orange-500/10 text-orange-900 dark:text-orange-200",
  "cross-chain":
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200",
  flash: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
}

const devImpactPanelClass: Record<EipStatus, string> = {
  implemented:
    "border-amber-500/50 bg-amber-500/5 text-amber-950 dark:text-amber-100",
  partial:
    "border-amber-500/50 bg-amber-500/5 text-amber-950 dark:text-amber-100",
  "not-implemented":
    "border-red-500/60 bg-red-500/5 text-red-950 dark:text-red-100",
  unknown:
    "border-amber-500/50 bg-amber-500/5 text-amber-950 dark:text-amber-100",
  alternative:
    "border-violet-500/50 bg-violet-500/5 text-violet-950 dark:text-violet-100",
}

export function EipCard({
  eip,
  impl,
  coinSymbol,
  defaultOpen = false,
  suppressEipOverview = false,
}: {
  eip: Eip
  impl: CoinEipImpl
  coinSymbol?: string
  defaultOpen?: boolean
  /** For /standards: summary is shown once in the section header. */
  suppressEipOverview?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const st = statusStyles[impl.status]
  const devImpactTone = devImpactPanelClass[impl.status]

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <Button
        type="button"
        variant="ghost"
        className="hover:bg-muted/50 flex h-auto w-full items-start justify-between gap-3 rounded-b-none rounded-t-lg px-4 py-3 text-left font-normal"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("font-mono text-xs", st.badge)}>
            {eip.id}
          </Badge>
          <span className="font-medium">{eip.name}</span>
          <Badge variant="outline" className={cn("text-[0.65rem] capitalize", st.badge)}>
            {st.label}
          </Badge>
          <Badge variant="outline" className={cn("text-[0.65rem]", categoryStyles[eip.category])}>
            {eip.category}
          </Badge>
          {coinSymbol ? (
            <Badge variant="secondary" className="font-mono text-[0.65rem]">
              {coinSymbol}
            </Badge>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground mt-0.5 size-5 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </Button>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 py-4 text-sm">
          {!suppressEipOverview ? (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
                Spec
              </div>
              <p className="text-muted-foreground leading-relaxed">{eip.summary}</p>
              {eip.eipsUrl ? (
                <a
                  href={eip.eipsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-2 inline-block text-xs font-medium hover:underline"
                >
                  Read on eips.ethereum.org →
                </a>
              ) : null}
            </div>
          ) : null}

          <div>
            <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
              Implementation
            </div>
            <p className="leading-relaxed">{impl.implementationNotes}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              <span className="font-medium text-foreground">Pattern:</span>{" "}
              {impl.contractPattern}
            </p>
          </div>

          {impl.keyFunctions.length > 0 ? (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
                Key functions
              </div>
              <pre className="font-mono overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
                {impl.keyFunctions.join("\n")}
              </pre>
            </div>
          ) : null}

          {impl.typeHash ? (
            <div>
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
                Type hash
              </div>
              <p className="font-mono break-all text-[11px] leading-relaxed">{impl.typeHash}</p>
            </div>
          ) : null}

          {impl.status === "implemented" && !suppressEipOverview ? (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-950 dark:text-emerald-100">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
                Why this matters
              </div>
              <p className="text-sm leading-relaxed">{eip.summary}</p>
            </div>
          ) : null}

          {impl.status === "partial" ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-950 dark:text-amber-100">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
                Partial compliance
              </div>
              <p className="text-sm leading-relaxed">
                This deployment diverges from the canonical ABI or semantics — treat integrations as
                coin-specific.
              </p>
            </div>
          ) : null}

          {impl.status === "alternative" && impl.alternativeStandard ? (
            <div className="rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-violet-950 dark:text-violet-100">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
                Alternative: {impl.alternativeStandard}
              </div>
              <p className="text-sm leading-relaxed">
                {impl.alternativeNotes ?? "Uses a non-standard mechanism that achieves a similar outcome."}
              </p>
            </div>
          ) : null}

          <div className={cn("rounded-md border px-3 py-2", devImpactTone)}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
              Developer impact
            </div>
            <p className="text-sm leading-relaxed">{impl.devImpact}</p>
          </div>

          {impl.footguns ? (
            <div className="rounded-md border-2 border-red-600 bg-red-500/10 px-3 py-2 text-red-950 dark:text-red-100">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-red-800 dark:text-red-200">
                Footguns
              </div>
              <p className="text-sm leading-relaxed font-medium">{impl.footguns}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
