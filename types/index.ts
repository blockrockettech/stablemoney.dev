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

export interface Feature {
  name: string
  description: string
  eip?: string
  category:
    | "authorization"
    | "cross-chain"
    | "compliance"
    | "yield"
    | "governance"
    | "stability"
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
