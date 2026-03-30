import type { Coin, Feature, FeatureAudience } from "@/types"
import { FEATURE_DETAILS } from "@/data/feature-details"

function inferAudience(category: Feature["category"]): FeatureAudience {
  switch (category) {
    case "compliance":
      return "corporate"
    case "authorization":
    case "yield":
      return "user"
    case "governance":
      return "both"
    default:
      return "both"
  }
}

function defaultRisk(category: Feature["category"]): string {
  switch (category) {
    case "compliance":
      return "Issuer/admin controls; integrations must handle freezes, pauses, and revert paths."
    case "authorization":
      return "Signing/permit bugs or bad UX can strand users or leak allowances."
    case "cross-chain":
      return "Wrong canonical address or OFT/bridge config breaks accounting across chains."
    case "yield":
      return "Yield sources and vault contracts carry smart-contract and market risk."
    case "governance":
      return "Governance can change parameters that affect your integration assumptions."
    case "stability":
      return "Peg/collateral stress can change behavior under market or oracle failure."
    default:
      return "Review protocol-level risks and monitor upgrades."
  }
}

/** Merges static `coins` features with developer-focused metadata from `feature-details`. */
export function mergeCoinFeatures(coin: Coin): Feature[] {
  const extras = FEATURE_DETAILS[coin.symbol] ?? {}
  return coin.features.map((f) => {
    const e = extras[f.name] ?? {}
    const merged: Feature = {
      ...f,
      ...e,
      standards: e.standards ?? (f.eip ? [f.eip] : f.standards),
      audience: e.audience ?? inferAudience(f.category),
      rationale: e.rationale ?? f.description,
      riskNotes: e.riskNotes ?? defaultRisk(f.category),
    }
    const refLinks = [...(merged.links ?? [])]
    if (merged.docsUrl) {
      const hasDoc = refLinks.some(
        (l) => l.url === merged.docsUrl || l.label.toLowerCase().includes("doc")
      )
      if (!hasDoc) {
        refLinks.unshift({ label: "Topic documentation", url: merged.docsUrl })
      }
    }
    merged.links = refLinks.length ? refLinks : undefined
    return merged
  })
}

export function primaryEthereumContract(coin: Coin): string | undefined {
  const d = coin.networks.find((n) => n.chain === "ethereum")
  const c = d?.contract?.trim()
  if (c?.startsWith("0x") && c.length === 42) return c
  return undefined
}
