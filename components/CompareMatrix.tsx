"use client"

import Link from "next/link"
import * as React from "react"
import type { Coin, Feature } from "@/types"
import { mergeCoinFeatures } from "@/lib/merge-features"
import { cn } from "@/lib/utils"

type MatrixStatus = "implemented" | "partial" | "not-implemented"

const statusDot: Record<MatrixStatus, string> = {
  implemented: "bg-emerald-500",
  partial: "bg-amber-500",
  "not-implemented": "bg-red-500",
}

const statusPill: Record<MatrixStatus, string> = {
  implemented: "bg-emerald-500/20",
  partial: "bg-amber-500/20",
  "not-implemented": "bg-red-500/20",
}

const categoryOrder: Feature["category"][] = [
  "stability",
  "authorization",
  "cross-chain",
  "yield",
  "governance",
  "compliance",
]

const categoryLabel: Record<Feature["category"], string> = {
  stability: "Stability",
  authorization: "Standards & Authorization",
  "cross-chain": "Infrastructure / Cross-chain",
  yield: "Yield",
  governance: "Governance / Industry",
  compliance: "Compliance / Risk",
}

function featureHref(name: string): string | null {
  const eip = /\bEIP-(\d+)\b/i.exec(name)
  if (eip) return `/standards#eip-${eip[1]}`
  const erc = /\bERC-(\d+)\b/i.exec(name)
  if (erc) return `/standards#eip-${erc[1]}`
  return null
}

function toShortSummary(input?: string): string {
  if (!input) return "No summary available for this capability yet."
  const text = input.trim().replace(/\s+/g, " ")
  const sentenceMatch = /^(.+?[.!?])(\s|$)/.exec(text)
  const sentence = sentenceMatch?.[1] ?? text
  if (sentence.length <= 180) return sentence
  return `${sentence.slice(0, 177).trimEnd()}...`
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function normalizeStandard(std: string): string {
  const t = std.trim().toUpperCase()
  const m = /^(EIP|ERC)-(\d+)$/.exec(t)
  return m ? `${m[1]}-${m[2]}` : t
}

function canonicalKey(feature: Feature): string {
  const standards = feature.standards ?? (feature.eip ? [feature.eip] : [])
  const normalized = standards.map(normalizeStandard)
  const eipLike = normalized.find((s) => /^(EIP|ERC)-\d+$/.test(s))
  if (eipLike) return `std:${eipLike}`
  if (normalized[0]) return `std:${normalized[0]}`
  return `name:${normalizeName(feature.name)}`
}

type Row = {
  key: string
  label: string
  category: Feature["category"]
  summary: string
  href: string | null
  presentByCoin: Record<string, boolean>
}

export function CompareMatrix({ coins }: { coins: Coin[] }) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const active = coins.filter(Boolean)
  if (active.length === 0) return null

  const featuresByCoin = React.useMemo(
    () => Object.fromEntries(active.map((c) => [c.symbol, mergeCoinFeatures(c)])),
    [active]
  )

  const rows = React.useMemo(() => {
    const rowMap = new Map<string, Row>()
    for (const coin of active) {
      const merged = featuresByCoin[coin.symbol] ?? []
      for (const f of merged) {
        const key = canonicalKey(f)
        const existing = rowMap.get(key)
        const summary = toShortSummary(f.rationale ?? f.description)
        if (!existing) {
          rowMap.set(key, {
            key,
            label: /^(std:)/.test(key) ? (f.standards?.[0] ?? f.eip ?? f.name) : f.name,
            category: f.category,
            summary,
            href: featureHref(f.standards?.[0] ?? f.eip ?? f.name),
            presentByCoin: { [coin.symbol]: true },
          })
        } else {
          existing.presentByCoin[coin.symbol] = true
          if (existing.summary.startsWith("No summary")) existing.summary = summary
          if (!existing.href) existing.href = featureHref(f.standards?.[0] ?? f.eip ?? f.name)
        }
      }
    }
    return Array.from(rowMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [active, featuresByCoin])

  const rowsByCategory = React.useMemo(() => {
    const grouped = new Map<Feature["category"], Row[]>()
    for (const row of rows) {
      if (!grouped.has(row.category)) grouped.set(row.category, [])
      grouped.get(row.category)!.push(row)
    }
    return grouped
  }, [rows])

  const statusFor = (coinSymbol: string, row: Row): MatrixStatus => {
    if (row.presentByCoin[coinSymbol]) return "implemented"
    const hasSameCategory = (featuresByCoin[coinSymbol] ?? []).some(
      (f) => f.category === row.category
    )
    return hasSameCategory ? "partial" : "not-implemented"
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[1080px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="sticky left-0 z-10 bg-muted/90 px-3 py-2 text-left font-medium backdrop-blur">
              Capability
            </th>
            {active.map((c) => (
              <th key={c.symbol} className="px-3 py-2 text-center font-mono font-medium">
                <Link href={`/coins/${c.symbol.toLowerCase()}`} className="text-primary hover:underline">
                  {c.symbol}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryOrder.map((cat) => {
            const groupRows = rowsByCategory.get(cat) ?? []
            if (!groupRows.length) return null
            return (
              <React.Fragment key={cat}>
                <tr className="border-y border-border bg-muted/30">
                  <td colSpan={active.length + 1} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                    {categoryLabel[cat]}
                  </td>
                </tr>
                {groupRows.map((row) => {
                  const isOpen = Boolean(expanded[row.key])
                  const statuses = active.map((coin) => statusFor(coin.symbol, row))
                  const allSame = statuses.every((s) => s === statuses[0])
                  const highlight = !allSame && statuses.some((s) => s === "implemented")
                  return (
                    <React.Fragment key={row.key}>
                      <tr className={cn("border-b border-border/70", highlight && "bg-amber-500/5")}>
                        <td className="bg-background sticky left-0 z-10 px-3 py-2 font-medium">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              {row.href ? (
                                <Link href={row.href} className="text-primary hover:underline">
                                  {row.label}
                                </Link>
                              ) : (
                                row.label
                              )}
                            </div>
                            <button
                              type="button"
                              className="text-primary shrink-0 text-[11px] font-medium hover:underline"
                              onClick={() =>
                                setExpanded((prev) => ({ ...prev, [row.key]: !prev[row.key] }))
                              }
                            >
                              {isOpen ? "Hide" : "Info"}
                            </button>
                          </div>
                        </td>
                        {active.map((coin, i) => {
                          const status = statuses[i]
                          const title =
                            status === "implemented"
                              ? `${coin.symbol}: implemented`
                              : status === "partial"
                                ? `${coin.symbol}: partial (related capability in same category)`
                                : `${coin.symbol}: not implemented`
                          return (
                            <td key={coin.symbol} className="px-3 py-2 text-center">
                              <span className="inline-flex justify-center" title={title}>
                                <span
                                  className={cn("inline-flex rounded-md p-1.5", statusPill[status])}
                                  aria-label={`${coin.symbol} ${row.label}: ${status}`}
                                >
                                  <span
                                    className={cn(
                                      "inline-block size-4 rounded-full ring-2 ring-background shadow-sm",
                                      statusDot[status]
                                    )}
                                    aria-hidden
                                  />
                                </span>
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                      {isOpen ? (
                        <tr className="border-b border-border/70 last:border-0">
                          <td
                            colSpan={active.length + 1}
                            className="text-muted-foreground bg-muted/20 px-3 py-2 text-xs leading-relaxed"
                          >
                            {row.summary}
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
