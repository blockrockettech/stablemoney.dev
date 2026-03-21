import { coins } from "@/data/coins"
import type { Coin } from "@/types"

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
}

export function getChainDisplayName(slug: string): string {
  return CHAIN_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function getAllChainSlugs(): string[] {
  const set = new Set<string>()
  for (const c of coins) {
    for (const n of c.networks) {
      set.add(n.chain)
    }
  }
  return Array.from(set).sort((a, b) =>
    getChainDisplayName(a).localeCompare(getChainDisplayName(b))
  )
}

export function getCoinsOnChain(chainSlug: string): {
  coin: Coin
  deployment: Coin["networks"][number]
}[] {
  const slug = chainSlug.toLowerCase()
  const out: { coin: Coin; deployment: Coin["networks"][number] }[] = []
  for (const coin of coins) {
    for (const deployment of coin.networks) {
      if (deployment.chain.toLowerCase() === slug) {
        out.push({ coin, deployment })
      }
    }
  }
  return out.sort((a, b) => a.coin.rank - b.coin.rank)
}
