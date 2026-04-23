export type EipStatus =
  | "implemented"
  | "partial"
  | "not-implemented"
  | "unknown"
  | "alternative"

export type EipScope = "network-specific" | "deployment-specific"

export type EipCategory =
  | "core"
  | "signature"
  | "upgradeability"
  | "vault"
  | "compliance"
  | "cross-chain"
  | "flash"

export interface Eip {
  id: string
  name: string
  category: EipCategory
  summary: string
  eipsUrl?: string
}

export interface CoinEipImpl {
  eipId: string
  status: EipStatus
  contractPattern: string
  keyFunctions: string[]
  scope?: EipScope
  scopeLabel?: string
  typeHash?: string
  implementationNotes: string
  devImpact: string
  footguns?: string
  alternativeStandard?: string
  alternativeNotes?: string
}

export interface CoinEipProfile {
  symbol: string
  contractName: string
  /** Ethereum mainnet address of the contract assessed for EIP compliance */
  contractAddress?: string
  decimals: number
  deployedBlock?: number
  isUpgradeable: boolean
  upgradePattern?: string
  implementations: CoinEipImpl[]
}
