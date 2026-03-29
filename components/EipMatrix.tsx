"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { EIPS, EIP_CATEGORY_ORDER } from "@/data/eips"
import type { Eip, EipCategory, EipStatus } from "@/types/eip"
import {
  COIN_EIP_SYMBOLS,
  eipAnchorId,
  getCellStatus,
  getEipImplementation,
} from "@/lib/eip-helpers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const statusDot: Record<EipStatus, string> = {
  implemented: "bg-emerald-500",
  partial: "bg-amber-500",
  "not-implemented": "bg-red-500",
  unknown: "bg-slate-500",
  alternative: "bg-violet-500",
}

const statusPill: Record<EipStatus, string> = {
  implemented: "bg-emerald-500/20",
  partial: "bg-amber-500/20",
  "not-implemented": "bg-red-500/20",
  unknown: "bg-slate-500/20",
  alternative: "bg-violet-500/20",
}

const statusLabel: Record<EipStatus, string> = {
  implemented: "Implemented",
  partial: "Partial",
  "not-implemented": "Not implemented",
  unknown: "Unknown",
  alternative: "Alternative",
}

const statusTooltipBadge: Record<EipStatus, string> = {
  implemented:
    "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  partial: "bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  "not-implemented": "bg-red-500/15 text-red-900 dark:bg-red-500/20 dark:text-red-300",
  unknown: "bg-slate-500/15 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200",
  alternative: "bg-violet-500/15 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
}

function MatrixCellTooltip({
  sym,
  eip,
  status,
  description,
  children,
}: {
  sym: string
  eip: Eip
  status: EipStatus
  description: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={180}
        closeDelay={80}
        closeOnClick={false}
        className="inline-flex cursor-default flex-col items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        render={(props) => <span {...props} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} align="center" className="max-w-[min(22rem,calc(100vw-1.5rem))]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/80 pb-2">
            <span className="font-mono text-xs font-semibold tracking-tight">{sym}</span>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <span className="font-mono text-xs font-medium text-primary">{eip.id}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
                statusTooltipBadge[status],
              )}
            >
              {statusLabel[status]}
            </span>
          </div>
          <p className="text-foreground/90 text-xs leading-relaxed">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function eipSortNumber(eip: Eip): number {
  const m = /^(?:EIP|ERC)-(\d+)$/i.exec(eip.id)
  return m ? Number(m[1]) : 9999
}

function scrollToEipDeepDive(eipId: string) {
  const el = document.getElementById(eipAnchorId(eipId))
  el?.scrollIntoView({ behavior: "smooth", block: "start" })
  try {
    history.replaceState(null, "", `#${eipAnchorId(eipId)}`)
  } catch {
    /* ignore */
  }
}

export function EipMatrix() {
  const [category, setCategory] = useState<EipCategory | "all">("all")
  const [showAlternatives, setShowAlternatives] = useState(true)

  const rows = useMemo(() => {
    let list = category === "all" ? [...EIPS] : EIPS.filter((e) => e.category === category)
    list.sort((a, b) => eipSortNumber(a) - eipSortNumber(b))
    return list
  }, [category])

  const categories: (EipCategory | "all")[] = ["all", ...EIP_CATEGORY_ORDER]

  function displayStatus(status: EipStatus): EipStatus {
    if (!showAlternatives && status === "alternative") return "not-implemented"
    return status
  }

  return (
    <TooltipProvider delay={200} closeDelay={100}>
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <Button
              key={c}
              type="button"
              variant={category === c ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize"
              onClick={() => setCategory(c)}
            >
              {c === "all" ? "All categories" : c}
            </Button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
          <span
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors",
              showAlternatives
                ? "border-violet-500/50 bg-violet-500/20"
                : "border-border bg-muted"
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                "inline-block size-3.5 rounded-full transition-transform",
                showAlternatives
                  ? "translate-x-4 bg-violet-500"
                  : "translate-x-0.5 bg-muted-foreground/50"
              )}
            />
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={showAlternatives}
            onChange={(e) => setShowAlternatives(e.target.checked)}
          />
          Show alternatives
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="bg-background sticky left-0 z-10 border-r border-border px-3 py-2 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Standard
              </th>
              {COIN_EIP_SYMBOLS.map((sym) => (
                <th key={sym} className="px-2 py-2 text-center font-mono text-xs font-medium">
                  <Link
                    href={`/coins/${sym.toLowerCase()}`}
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sym}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((eip) => (
              <tr
                key={eip.id}
                className="group border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40"
                tabIndex={0}
                role="button"
                aria-label={`${eip.id} ${eip.name}: open deep dive`}
                onClick={() => scrollToEipDeepDive(eip.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    scrollToEipDeepDive(eip.id)
                  }
                }}
              >
                <td className="bg-background sticky left-0 z-10 border-r border-border px-3 py-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  <div className="font-mono text-xs font-semibold text-primary underline-offset-2 group-hover:underline">
                    {eip.id}
                  </div>
                  <div className="text-muted-foreground text-[0.7rem] leading-snug">{eip.name}</div>
                </td>
                {COIN_EIP_SYMBOLS.map((sym) => {
                  const rawStatus = getCellStatus(sym, eip.id)
                  const status = displayStatus(rawStatus)
                  const impl = getEipImplementation(sym, eip.id)
                  const isAlt = rawStatus === "alternative" && showAlternatives

                  let description = impl?.devImpact ?? "Not yet verified."
                  if (isAlt && impl?.alternativeStandard) {
                    description = `Via ${impl.alternativeStandard}: ${impl.alternativeNotes ?? impl.devImpact}`
                  }

                  return (
                    <td key={sym} className="px-2 py-2 text-center align-middle">
                      <MatrixCellTooltip
                        sym={sym}
                        eip={eip}
                        status={status}
                        description={description}
                      >
                        <span
                          className={cn(
                            "inline-flex rounded-md p-1.5",
                            statusPill[status],
                          )}
                          aria-label={`${sym} ${eip.id}: ${status}`}
                        >
                          <span
                            className={cn(
                              "inline-block size-4 rounded-full ring-2 ring-background shadow-sm",
                              statusDot[status],
                            )}
                            aria-hidden
                          />
                        </span>
                        {isAlt && impl?.alternativeStandard ? (
                          <span className="text-[0.55rem] leading-none text-violet-400 font-medium max-w-[4.5rem] truncate">
                            {impl.alternativeStandard}
                          </span>
                        ) : null}
                      </MatrixCellTooltip>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td
                colSpan={COIN_EIP_SYMBOLS.length + 1}
                className="px-3 py-2.5 text-center text-[0.7rem] leading-relaxed text-muted-foreground"
              >
                Data sourced from verified Etherscan contract source code. Implementations may differ across networks
                — always verify on the specific chain you integrate with.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ul className="text-muted-foreground flex flex-wrap gap-4 text-xs">
        <li className="flex items-center gap-1.5">
          <span className={cn("inline-block size-2.5 rounded-full", statusDot.implemented)} />
          Implemented
        </li>
        <li className="flex items-center gap-1.5">
          <span className={cn("inline-block size-2.5 rounded-full", statusDot.partial)} />
          Partial
        </li>
        {showAlternatives ? (
          <li className="flex items-center gap-1.5">
            <span className={cn("inline-block size-2.5 rounded-full", statusDot.alternative)} />
            Alternative
          </li>
        ) : null}
        <li className="flex items-center gap-1.5">
          <span
            className={cn("inline-block size-2.5 rounded-full", statusDot["not-implemented"])}
          />
          Not implemented
        </li>
        <li className="flex items-center gap-1.5">
          <span className={cn("inline-block size-2.5 rounded-full", statusDot.unknown)} />
          Unknown
        </li>
      </ul>
    </div>
    </TooltipProvider>
  )
}
