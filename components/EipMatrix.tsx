"use client"

import { useMemo, useState } from "react"
import { EIPS } from "@/data/eips"
import type { Eip, EipCategory, EipStatus } from "@/types/eip"
import {
  COIN_EIP_SYMBOLS,
  eipAnchorId,
  getCellStatus,
  getEipImplementation,
} from "@/lib/eip-helpers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const statusDot: Record<EipStatus, string> = {
  implemented: "bg-emerald-500",
  partial: "bg-amber-500",
  "not-implemented": "bg-red-500",
  unknown: "bg-muted-foreground/60",
}

function eipSortNumber(eip: Eip): number {
  const m = /^(?:EIP|ERC)-(\d+)$/i.exec(eip.id)
  return m ? Number(m[1]) : 9999
}

type SortMode = "eip" | "category" | "usdc"

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
  const [sort, setSort] = useState<SortMode>("eip")

  const rows = useMemo(() => {
    let list = category === "all" ? [...EIPS] : EIPS.filter((e) => e.category === category)

    if (sort === "eip") {
      list.sort((a, b) => eipSortNumber(a) - eipSortNumber(b))
    } else if (sort === "category") {
      const order: EipCategory[] = [
        "core",
        "signature",
        "upgradeability",
        "vault",
        "compliance",
      ]
      list.sort(
        (a, b) =>
          order.indexOf(a.category) - order.indexOf(b.category) ||
          eipSortNumber(a) - eipSortNumber(b),
      )
    } else {
      const score = (e: Eip) => {
        const s = getCellStatus("USDC", e.id)
        return s === "implemented" ? 0 : s === "partial" ? 1 : s === "unknown" ? 2 : 3
      }
      list.sort((a, b) => score(a) - score(b) || eipSortNumber(a) - eipSortNumber(b))
    }

    return list
  }, [category, sort])

  const categories: (EipCategory | "all")[] = [
    "all",
    "core",
    "signature",
    "upgradeability",
    "vault",
    "compliance",
  ]

  return (
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="border-input bg-background rounded-md border px-2 py-1.5 text-xs"
          >
            <option value="eip">EIP number</option>
            <option value="category">Category</option>
            <option value="usdc">USDC-first (implemented first)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="bg-background sticky left-0 z-10 border-r border-border px-3 py-2 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Standard
              </th>
              {COIN_EIP_SYMBOLS.map((sym) => (
                <th key={sym} className="px-2 py-2 text-center font-mono text-xs font-medium">
                  {sym}
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
                  const status = getCellStatus(sym, eip.id)
                  const impl = getEipImplementation(sym, eip.id)
                  const title = impl?.devImpact ?? "No profile row — treated as not implemented"
                  return (
                    <td key={sym} className="px-2 py-2 text-center align-middle">
                      <span
                        className="inline-flex justify-center"
                        title={`${title} — click row for ${eip.id} deep dive`}
                      >
                        <span
                          className={cn(
                            "inline-block size-3 rounded-full ring-2 ring-background",
                            statusDot[status],
                          )}
                          aria-hidden
                        />
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
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
  )
}
