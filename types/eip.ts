export type EipStatus =
  | "implemented"
  | "partial"
  | "not-implemented"
  | "unknown"

export type EipCategory =
  | "core"
  | "signature"
  | "upgradeability"
  | "vault"
  | "compliance"

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
  typeHash?: string
  implementationNotes: string
  devImpact: string
  footguns?: string
}

export interface CoinEipProfile {
  symbol: string
  contractName: string
  deployedBlock?: number
  isUpgradeable: boolean
  upgradePattern?: string
  implementations: CoinEipImpl[]
}
