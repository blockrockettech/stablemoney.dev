export type StablecoinType = "fiat" | "crypto" | "synthetic" | "hybrid"
export type RiskLevel = "low" | "medium" | "high"

export interface NetworkDeployment {
  name: string
  chain: string
  standard: string
  contract: string
  isPrimary: boolean
  notes?: string
}

/** Who this capability primarily serves in product terms */
export type FeatureAudience = "user" | "corporate" | "both"

export interface FeatureLink {
  label: string
  url: string
}

export interface Feature {
  name: string
  description: string
  /** Legacy single label; prefer `standards` when present */
  eip?: string
  /** ERC / EIP / other specs (e.g. ERC-20, EIP-2612, Token-2022) */
  standards?: string[]
  category:
    | "authorization"
    | "cross-chain"
    | "compliance"
    | "yield"
    | "governance"
    | "stability"
  /** If omitted, inferred from category in the UI */
  audience?: FeatureAudience
  /** Why engineers care — integration or product rationale */
  rationale?: string
  /** Operational or integration risk specific to this capability */
  riskNotes?: string
  /** Primary external doc for this topic */
  docsUrl?: string
  /** Docs, specs, verified source on explorer, GitHub paths, etc. */
  links?: FeatureLink[]
}

export interface RiskFactor {
  label: string
  level: RiskLevel
}

export interface Coin {
  symbol: string
  name: string
  issuer: string
  rank: number
  marketCap: string
  type: StablecoinType
  description: string
  networks: NetworkDeployment[]
  features: Feature[]
  reserves: string
  collateralType: string
  pegMechanism: string
  auditor: string
  defiIntegration: string
  yield: string
  risks: RiskFactor[]
  technicalNotes: string
  docsUrl?: string
  githubUrl?: string
}
