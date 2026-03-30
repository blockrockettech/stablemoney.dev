import { coins } from "@/data/coins"

const CHAIN_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  bnb: "BNB Chain",
  solana: "Solana",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
  optimism: "Optimism",
  base: "Base",
  avalanche: "Avalanche",
  tron: "TRON",
  bitcoin: "Bitcoin",
  ton: "TON",
  sui: "Sui",
  stellar: "Stellar",
  aptos: "Aptos",
  near: "NEAR",
  hedera: "Hedera",
  zksync: "ZKsync Era",
  starknet: "Starknet",
  xrp: "XRP Ledger",
  xrpl: "XRP Ledger",
  gnosis: "Gnosis",
  mantle: "Mantle",
}

function chainDisplayName(slug: string): string {
  return CHAIN_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

/** Unique `chain` slugs across all coin deployments (sorted by display name). */
export function getAllChainSlugs(): string[] {
  const set = new Set<string>()
  for (const c of coins) {
    for (const n of c.networks) {
      set.add(n.chain)
    }
  }
  return Array.from(set).sort((a, b) =>
    chainDisplayName(a).localeCompare(chainDisplayName(b)),
  )
}
