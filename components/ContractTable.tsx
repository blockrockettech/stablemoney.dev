"use client"

import Link from "next/link"
import type { NetworkDeployment } from "@/types"
import { CopyButton } from "@/components/CopyButton"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export function ContractTable({ networks }: { networks: NetworkDeployment[] }) {
  const sorted = [...networks].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 font-medium">Network</th>
            <th className="px-3 py-2 font-medium">Standard</th>
            <th className="px-3 py-2 font-medium">Contract</th>
            <th className="w-24 px-3 py-2 font-medium">Explorer</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => {
            const primary = n.isPrimary
            return (
              <tr
                key={`${n.chain}-${n.contract}-${n.name}`}
                className={cn(
                  "border-b border-border/80 last:border-0",
                  primary && "bg-primary/5"
                )}
              >
                <td className="px-3 py-2 align-top">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/chains/${encodeURIComponent(n.chain.toLowerCase())}`}
                      className="hover:text-primary font-medium hover:underline"
                    >
                      {n.name}
                    </Link>
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
                  <div className="flex items-start gap-1">
                    <code className="font-mono text-xs leading-relaxed break-all">
                      {n.contract}
                    </code>
                    <CopyButton text={n.contract} />
                  </div>
                  {n.notes ? (
                    <p className="text-muted-foreground mt-1 text-xs">{n.notes}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2 align-top">
                  {n.explorerUrl ? (
                    <a
                      href={n.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      View
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
