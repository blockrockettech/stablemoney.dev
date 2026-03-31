import type { StablecoinType } from "@/types"

/** Short labels for coin type badges and detail pages (aligned with filter semantics). */
export const STABLECOIN_TYPE_LABEL: Record<StablecoinType, string> = {
  fiat: "Fiat / issuer reserves",
  crypto: "On-chain & RWA collateral",
  synthetic: "Synthetic / delta-neutral",
  hybrid: "Treasury / mixed model",
}
