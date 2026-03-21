import type { Coin, Feature } from "@/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { primaryEthereumContract } from "@/lib/merge-features"

function standardSpecHref(label: string): string | null {
  const eip = /^EIP-(\d+)$/i.exec(label.trim())
  if (eip) return `https://eips.ethereum.org/EIPS/eip-${eip[1]}`
  const erc = /^ERC-(\d+)$/i.exec(label.trim())
  if (erc) return `https://eips.ethereum.org/EIPS/eip-${erc[1]}`
  return null
}

function standardSiteHref(label: string): string | null {
  const eip = /^EIP-(\d+)$/i.exec(label.trim())
  if (eip) return `/standards#eip-${eip[1]}`
  const erc = /^ERC-(\d+)$/i.exec(label.trim())
  if (erc) return `/standards#eip-${erc[1]}`
  return null
}

function AudienceBadge({ audience }: { audience: NonNullable<Feature["audience"]> }) {
  const cls =
    audience === "user"
      ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      : audience === "corporate"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
        : "border-violet-500/40 bg-violet-500/10 text-violet-800 dark:text-violet-200"
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[0.65rem] font-medium uppercase",
        cls
      )}
    >
      {audience === "user" ? "User" : audience === "corporate" ? "Corporate" : "Both"}
    </span>
  )
}

function StandardsCell({ standards }: { standards?: string[] }) {
  if (!standards?.length) return <span className="text-muted-foreground">—</span>
  return (
    <ul className="flex flex-wrap gap-1">
      {standards.map((s) => {
        const spec = standardSpecHref(s)
        const onSite = standardSiteHref(s)
        if (onSite) {
          return (
            <li key={s} className="inline-flex items-center gap-1">
              <Link
                href={onSite}
                className="text-primary font-mono text-[0.7rem] hover:underline"
              >
                {s}
              </Link>
              {spec ? (
                <a
                  href={spec}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground inline-flex hover:text-foreground"
                  title="Official EIP text"
                  aria-label={`${s} on eips.ethereum.org`}
                >
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </li>
          )
        }
        return (
          <li key={s}>
            <Badge variant="outline" className="font-mono text-[0.65rem]">
              {s}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

function LinksCell({ links }: { links?: Feature["links"] }) {
  if (!links?.length) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.url + l.label}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
          >
            {l.label}
            <ExternalLink className="size-3 shrink-0 opacity-70" />
          </a>
        </li>
      ))}
    </ul>
  )
}

export function FeatureTable({ coin, features }: { coin: Coin; features: Feature[] }) {
  const eth = primaryEthereumContract(coin)

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
        Engineering-oriented breakdown of capabilities: standards, who they matter for, integration
        rationale, per-feature risks, and vetted external references (specs, docs, verified source).
      </p>
      {(coin.githubUrl || eth) && (
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {coin.githubUrl ? (
            <span>
              Protocol repo:{" "}
              <a
                href={coin.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-mono hover:underline"
              >
                {coin.githubUrl.replace(/^https?:\/\//, "")}
              </a>
            </span>
          ) : null}
          {eth ? (
            <span>
              Primary Ethereum verified source:{" "}
              <a
                href={`https://etherscan.io/address/${eth}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-mono hover:underline"
              >
                Etherscan
              </a>
            </span>
          ) : null}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Feature</th>
              <th className="px-3 py-2 font-medium">Standards</th>
              <th className="px-3 py-2 font-medium">Audience</th>
              <th className="min-w-[200px] px-3 py-2 font-medium">Why it matters</th>
              <th className="min-w-[200px] px-3 py-2 font-medium">Risk / caveat</th>
              <th className="min-w-[180px] px-3 py-2 font-medium">References</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.name} className="border-b border-border/70 last:border-0 align-top">
                <td className="px-3 py-3">
                  <div className="font-medium">{f.name}</div>
                  <Badge variant="secondary" className="mt-1 text-[0.65rem] capitalize">
                    {f.category.replace("-", " ")}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <StandardsCell standards={f.standards} />
                </td>
                <td className="px-3 py-3">
                  {f.audience ? <AudienceBadge audience={f.audience} /> : "—"}
                </td>
                <td className="text-muted-foreground px-3 py-3 text-xs leading-relaxed">
                  {f.rationale ?? f.description}
                </td>
                <td className="text-muted-foreground px-3 py-3 text-xs leading-relaxed">
                  {f.riskNotes}
                </td>
                <td className="px-3 py-3">
                  <LinksCell links={f.links} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
