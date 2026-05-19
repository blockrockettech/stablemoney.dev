"use client"

import { useState } from "react"
import type { NetworkDeployment } from "@/types"
import { PROXY_LABELS, PROXY_CLASSES } from "@/lib/proxy-labels"
import { CopyButton } from "@/components/CopyButton"
import { ChevronDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

function derivedImplExplorerUrl(
  tokenExplorerUrl: string | null,
  implAddress: string
): string | null {
  if (!tokenExplorerUrl) return null
  const replaced = tokenExplorerUrl.replace(/0x[0-9a-fA-F]{40}/i, implAddress)
  return replaced !== tokenExplorerUrl ? replaced : null
}

function hasExpandableDetails(n: NetworkDeployment): boolean {
  return !!(
    n.implVersion ||
    n.implLastChanged ||
    n.mainnetDiffers ||
    n.implementation ||
    n.proxyAdmin
  )
}

export function ContractTable({ networks }: { networks: NetworkDeployment[] }) {
  const sorted = [...networks].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 font-medium">Network</th>
            <th className="px-3 py-2 font-medium">Standard</th>
            <th className="w-36 px-3 py-2 font-medium">Upgrade</th>
            <th className="px-3 py-2 font-medium">Contract</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => {
            const primary = n.isPrimary
            const rowKey = `${n.chain}-${n.contract}-${n.name}`
            const isExpanded = expanded.has(rowKey)
            const canExpand = hasExpandableDetails(n)
            const implExplorer =
              n.implementation
                ? derivedImplExplorerUrl(n.explorerUrl, n.implementation)
                : null

            return (
              <tr
                key={rowKey}
                className={cn(
                  "border-b border-border/80 last:border-0",
                  primary && "bg-primary/5"
                )}
              >
                <td className="px-3 py-2 align-top">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{n.name}</span>
                    <span
                      className={cn(
                        "w-fit rounded px-1.5 py-0.5 text-[0.65rem] uppercase",
                        primary
                          ? "bg-primary/20 text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {primary ? "Primary" : "Secondary"}
                    </span>
                  </div>
                </td>

                <td className="text-muted-foreground px-3 py-2 align-top">
                  {n.standard}
                </td>

                <td className="px-3 py-2 align-top">
                  {n.proxyType ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[0.65rem] font-medium uppercase",
                            PROXY_CLASSES[n.proxyType]
                          )}
                        >
                          {PROXY_LABELS[n.proxyType]}
                        </span>
                        {canExpand && (
                          <button
                            onClick={() => toggle(rowKey)}
                            aria-label={isExpanded ? "Collapse proxy details" : "Expand proxy details"}
                            className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                          >
                            <ChevronDown
                              className={cn(
                                "size-3 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-1 space-y-1.5 rounded border border-border/60 bg-muted/30 px-2 py-1.5 text-[0.65rem]">
                          {n.implVersion && (
                            <div>
                              <span className="text-muted-foreground">Version </span>
                              <span className="font-mono font-medium">{n.implVersion}</span>
                            </div>
                          )}
                          {n.implLastChanged && (
                            <div>
                              <span className="text-muted-foreground">Last updated </span>
                              <span className="font-medium">{n.implLastChanged}</span>
                            </div>
                          )}
                          {n.implementation && (
                            <div>
                              <span className="text-muted-foreground block">Impl address</span>
                              <div className="mt-0.5 flex items-center gap-1">
                                {implExplorer ? (
                                  <a
                                    href={implExplorer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary inline-flex items-center gap-0.5 font-mono hover:underline"
                                  >
                                    {n.implementation}
                                    <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                                  </a>
                                ) : (
                                  <span className="font-mono">{n.implementation}</span>
                                )}
                                <CopyButton text={n.implementation} />
                              </div>
                            </div>
                          )}
                          {n.proxyAdmin && (
                            <div>
                              <span className="text-muted-foreground">Admin </span>
                              <span className="font-mono font-medium">{n.proxyAdmin}</span>
                            </div>
                          )}
                          {n.mainnetDiffers && (
                            <div className="text-orange-600 dark:text-orange-400">
                              ↕ {n.mainnetDiffers}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : n.mainnetDiffers ? (
                    <span className="text-[0.6rem] leading-tight text-orange-600 dark:text-orange-400">
                      ↕ {n.mainnetDiffers}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>

                <td className="px-3 py-2 align-top">
                  <div className="flex items-start gap-1">
                    {n.explorerUrl ? (
                      <a
                        href={n.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-start gap-1"
                      >
                        <code className="font-mono text-xs leading-relaxed break-all">
                          {n.contract}
                        </code>
                        <ExternalLink className="size-3 mt-0.5 shrink-0 opacity-60" />
                      </a>
                    ) : (
                      <code className="font-mono text-xs leading-relaxed break-all">
                        {n.contract}
                      </code>
                    )}
                    <CopyButton text={n.contract} />
                  </div>
                  {n.notes ? (
                    <p className="text-muted-foreground mt-1 text-xs">{n.notes}</p>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
