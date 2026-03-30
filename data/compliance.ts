/**
 * Onchain compliance configuration for stablecoin wallet checks.
 *
 * RPC_URLS — swap freely; no API key required for the defaults.
 * SELECTORS — verified 4-byte ABI selectors (keccak256(sig)[0..3]).
 *
 * Support levels:
 *   "evm"          — live eth_call, selector confirmed against deployed contract
 *   "pending-abi"  — EVM contract exists but function sig needs on-chain ABI verification
 *   "coming-soon"  — non-EVM network (TRON, Solana, XRPL, …) — architecture slot ready
 *   "no-controls"  — token contract has no freeze/blacklist capability
 */

// ── RPC endpoints ─────────────────────────────────────────────────────────────
// All CORS-friendly public endpoints safe for browser fetch().
// Swap any value for an Alchemy/Infura/QuickNode URL to increase rate limits.
//
// Ethereum has three slots (ethereum_a/b/c) so checks are spread across
// different providers in parallel — each provider only receives 2 sequential
// calls instead of 6, avoiding free-tier rate limits.
//
// https://ethereumnodes.com/
// 
// Avoided:
//   bsc-dataseed.binance.org  — no CORS headers, browser fetch always blocked
//   cloudflare-eth.com        — rate-limits under parallel load
//   eth.llamarpc.com          — aggressive rate-limiting on free tier
export const EVM_RPC_URLS: Record<string, string> = {
  ethereum_a: "https://eth.llamarpc.com", // LlamaRPC - Free tier, 30 req/s
  ethereum_b: "https://ethereum-rpc.publicnode.com", // PublicNode - CORS enabled
  ethereum_c: "https://1rpc.io/eth", // 1RPC by Automata — privacy-focused, CORS enabled
  bnb: "https://bsc.publicnode.com", // PublicNode — CORS enabled
  polygon: "https://polygon-bor.publicnode.com", // PublicNode — CORS enabled
  arbitrum: "https://arb1.arbitrum.io/rpc", // Arbitrum Foundation
  optimism: "https://mainnet.optimism.io", // OP Foundation
  avalanche: "https://api.avax.network/ext/bc/C/rpc", // Avax Foundation
  base: "https://mainnet.base.org", // Base / Coinbase
  zksync: "https://mainnet.era.zksync.io", // Matter Labs
}

// ── Verified ABI function selectors ───────────────────────────────────────────
// keccak256(functionSignature), first 4 bytes. Verified via `cast sig`.
export const SELECTORS = {
  // Circle FiatToken — USDC, TUSD
  isBlacklisted:  "0xfe575a87",  // isBlacklisted(address) → bool
  // Tether TetherToken — USDT Ethereum, USDT BNB
  isBlackListed:  "0xe47d6060",  // isBlackListed(address) → bool
  // Tether WithBlockedList — USDT Polygon, Arbitrum, Avalanche
  isBlocked:      "0xfbac3951",  // isBlocked(address) → bool
  // Paxos FiatToken — PYUSD
  isFrozen:       "0xe5839836",  // isFrozen(address) → bool
  // Shared Stablecoin.sol pattern — FDUSD, USD1 (public mapping getter)
  frozen:         "0xd0516650",  // frozen(address) → bool
  // Ripple StablecoinUpgradeableV2 — RLUSD
  accountPaused:  "0xbc8c4b4f",  // accountPaused(address) → bool
  // Standard ERC-20 balance (for seized-funds-at-risk check)
  balanceOf:      "0x70a08231",  // balanceOf(address) → uint256
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComplianceCheckType = "blacklist" | "freeze"

export interface ComplianceCheck {
  /** Human-readable function name shown in dev details */
  fnName: string
  /** 4-byte hex selector, e.g. "0xfe575a87" */
  selector: string
  type: ComplianceCheckType
  /** One-line description of what this check detects */
  description: string
}

export interface EvmChainConfig {
  support: "evm"
  chainName: string
  chain: string
  contract: string
  explorerUrl: string | null
  /** Swappable RPC endpoint (see EVM_RPC_URLS) */
  rpcUrl: string
  checks: ComplianceCheck[]
  /** Extra dev context surfaced in results */
  notes?: string
}

export interface PendingAbiChainConfig {
  support: "pending-abi"
  chainName: string
  chain: string
  contract: string
  explorerUrl: string | null
  /** What needs verifying before this goes live */
  reason: string
}

export interface ComingSoonChainConfig {
  support: "coming-soon"
  chainName: string
  chain: string
  contract: string
  explorerUrl: string | null
  reason: string
}

export type ChainConfig = EvmChainConfig | PendingAbiChainConfig | ComingSoonChainConfig

export interface CoinComplianceConfig {
  symbol: string
  name: string
  issuer: string
  /** False for immutable / decentralised tokens with no issuer freeze capability */
  hasComplianceControls: boolean
  noControlsReason?: string
  chains: ChainConfig[]
  /** Link to issuer compliance/blacklist documentation */
  complianceDocsUrl?: string
  /**
   * Issuer seizure note — shown as a warning when flagged + balance > 0.
   * Describes what happens to frozen funds beyond a simple freeze.
   */
  seizureNote?: string
}

// ── Compliance config ─────────────────────────────────────────────────────────

export const COMPLIANCE_CONFIG: CoinComplianceConfig[] = [
  // ── USDT ──────────────────────────────────────────────────────────────────
  {
    symbol: "USDT",
    name: "Tether USD",
    issuer: "Tether Limited",
    hasComplianceControls: true,
    complianceDocsUrl: "https://tether.to/en/transparency/",
    seizureNote:
      "destroyBlackFunds(address) permanently burns the entire balance of a blacklisted address. More aggressive than USDC's freeze-in-place — funds are irrecoverably destroyed.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        explorerUrl: "https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7",
        rpcUrl: EVM_RPC_URLS.ethereum_a,
        checks: [
          {
            fnName: "isBlackListed",
            selector: SELECTORS.isBlackListed,
            type: "blacklist",
            description: "Returns true if the address is on the Tether blacklist. Transfers revert. Tether can subsequently call destroyBlackFunds() to burn the balance.",
          },
        ],
        notes: "6 decimals. Primary deployment — ~103B supply, 13M+ holders.",
      },
      {
        support: "coming-soon",
        chainName: "BNB Chain",
        chain: "bnb",
        contract: "0x55d398326f99059fF775485246999027B3197955",
        explorerUrl: "https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955",
        reason: "BNB Chain USDT (BEP-20) has no onchain compliance query — bytecode analysis confirmed no blocklist selector present in this deployment.",
      },
      {
        support: "evm",
        chainName: "Polygon",
        chain: "polygon",
        contract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        explorerUrl: "https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        rpcUrl: EVM_RPC_URLS.polygon,
        checks: [
          {
            fnName: "isBlocked",
            selector: SELECTORS.isBlocked,
            type: "blacklist",
            description: "UChildUSDT WithBlockedList module. Blocked addresses cannot transfer. destroyBlockedFunds() can permanently burn the balance.",
          },
        ],
        notes: "PoS-bridged USDT (UChildUSDT0). Uses WithBlockedList module — different from primary TetherToken isBlackListed pattern.",
      },
      {
        support: "evm",
        chainName: "Arbitrum",
        chain: "arbitrum",
        contract: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        explorerUrl: "https://arbiscan.io/token/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        rpcUrl: EVM_RPC_URLS.arbitrum,
        checks: [
          {
            fnName: "isBlocked",
            selector: SELECTORS.isBlocked,
            type: "blacklist",
            description: "ArbitrumExtensionV2 WithBlockedList module. destroyBlockedFunds() can permanently burn the balance.",
          },
        ],
        notes: "USDT0 — LayerZero OFT (ArbitrumExtensionV2). Same WithBlockedList pattern as Polygon.",
      },
      {
        support: "coming-soon",
        chainName: "Optimism",
        chain: "optimism",
        contract: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        explorerUrl: "https://optimistic.etherscan.io/token/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        reason: "L2StandardERC20 bridge token — no blacklist or freeze capability on this deployment. Only bridge-controlled mint/burn.",
      },
      {
        support: "evm",
        chainName: "Avalanche",
        chain: "avalanche",
        contract: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        explorerUrl: "https://snowtrace.io/token/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        rpcUrl: EVM_RPC_URLS.avalanche,
        checks: [
          {
            fnName: "isBlocked",
            selector: SELECTORS.isBlocked,
            type: "blacklist",
            description: "TetherToken WithBlockedList module. destroyBlockedFunds() can permanently burn the balance.",
          },
        ],
        notes: "Avalanche TetherToken. Same WithBlockedList pattern as Polygon and Arbitrum.",
      },
      {
        support: "coming-soon",
        chainName: "TRON",
        chain: "tron",
        contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        explorerUrl: "https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        reason: "TRC-20 — TRON JSON-RPC support coming soon.",
      },
      {
        support: "coming-soon",
        chainName: "Solana",
        chain: "solana",
        contract: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        explorerUrl: "https://solscan.io/token/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        reason: "SPL Token — Solana web3 support coming soon.",
      },
    ],
  },

  // ── USDC ──────────────────────────────────────────────────────────────────
  {
    symbol: "USDC",
    name: "USD Coin",
    issuer: "Circle",
    hasComplianceControls: true,
    complianceDocsUrl: "https://www.circle.com/en/legal/usdc-terms",
    seizureNote:
      "USDC uses freeze-in-place: a blacklisted address cannot send or receive tokens, but the balance is NOT automatically destroyed. Circle can upgrade the contract, but as of FiatToken v2.2 there is no destroyBlackFunds equivalent.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        explorerUrl: "https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        rpcUrl: EVM_RPC_URLS.ethereum_a,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Returns true if the address is on Circle's blacklist. All transfers, mints, and burns revert for blacklisted accounts.",
          },
        ],
        notes: "FiatToken v2.2. 6 decimals. Bit-packed storage: bit 255 = blacklist flag, bits 0–254 = balance.",
      },
      {
        support: "evm",
        chainName: "Base",
        chain: "base",
        contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        explorerUrl: "https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        rpcUrl: EVM_RPC_URLS.base,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Circle FiatToken blacklist check. Same interface as Ethereum.",
          },
        ],
        notes: "Native USDC on Base (not bridged).",
      },
      {
        support: "evm",
        chainName: "Arbitrum",
        chain: "arbitrum",
        contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        explorerUrl: "https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        rpcUrl: EVM_RPC_URLS.arbitrum,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Circle FiatToken blacklist check. Same interface as Ethereum.",
          },
        ],
        notes: "Native USDC on Arbitrum (not USDC.e bridged).",
      },
      {
        support: "evm",
        chainName: "Polygon",
        chain: "polygon",
        contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        explorerUrl: "https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        rpcUrl: EVM_RPC_URLS.polygon,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Circle FiatToken blacklist check. Same interface as Ethereum.",
          },
        ],
        notes: "Native USDC on Polygon (not bridged 0x2791).",
      },
      {
        support: "evm",
        chainName: "Avalanche",
        chain: "avalanche",
        contract: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        explorerUrl: "https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        rpcUrl: EVM_RPC_URLS.avalanche,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Circle FiatToken blacklist check. Same interface as Ethereum.",
          },
        ],
      },
      {
        support: "evm",
        chainName: "Optimism",
        chain: "optimism",
        contract: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        explorerUrl: "https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        rpcUrl: EVM_RPC_URLS.optimism,
        checks: [
          {
            fnName: "isBlacklisted",
            selector: SELECTORS.isBlacklisted,
            type: "blacklist",
            description: "Circle FiatToken blacklist check. Same interface as Ethereum.",
          },
        ],
        notes: "Native USDC on Optimism.",
      },
      {
        support: "coming-soon",
        chainName: "Solana",
        chain: "solana",
        contract: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        explorerUrl: "https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        reason: "SPL Token freeze authority check — Solana web3 support coming soon.",
      },
    ],
  },

  // ── PYUSD ─────────────────────────────────────────────────────────────────
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    issuer: "Paxos Trust Company",
    hasComplianceControls: true,
    complianceDocsUrl: "https://www.paypal.com/us/digital-wallet/pyusd",
    seizureNote:
      "Paxos holds a permanent delegate on Solana (Token-2022) to freeze or seize funds. On Ethereum, the freeze mechanism follows Paxos FiatToken pattern.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
        explorerUrl: "https://etherscan.io/token/0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
        rpcUrl: EVM_RPC_URLS.ethereum_b,
        checks: [
          {
            fnName: "isFrozen",
            selector: SELECTORS.isFrozen,
            type: "freeze",
            description: "Paxos ASSET_PROTECTION_ROLE can freeze individual addresses. wipeFrozenAddress() can permanently destroy a frozen balance.",
          },
        ],
        notes: "Paxos FiatToken v1. 6 decimals. Also integrates an external sanctions list via SanctionedAddressListUpdate events.",
      },
      {
        support: "coming-soon",
        chainName: "Solana",
        chain: "solana",
        contract: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        explorerUrl: "https://solscan.io/token/2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        reason: "Token-2022 permanent delegate freeze — Solana support coming soon.",
      },
    ],
  },

  // ── RLUSD ─────────────────────────────────────────────────────────────────
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    issuer: "Standard Custody & Trust Company (Ripple)",
    hasComplianceControls: true,
    complianceDocsUrl: "https://ripple.com/solutions/stablecoin/",
    seizureNote:
      "CLAWBACKER_ROLE can call clawback(address, uint256) to permanently destroy tokens from any address, including frozen ones. The most aggressive seizure mechanism among major stablecoins.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD",
        explorerUrl: "https://etherscan.io/token/0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD",
        rpcUrl: EVM_RPC_URLS.ethereum_b,
        checks: [
          {
            fnName: "accountPaused",
            selector: SELECTORS.accountPaused,
            type: "freeze",
            description: "PAUSER_ROLE calls pauseAccounts(address[]) to freeze. accountPaused returns true if frozen. CLAWBACKER_ROLE can then call clawback() to permanently destroy tokens.",
          },
        ],
        notes: "StablecoinUpgradeableV2 (UUPS). AccountPausableUpgradeable with ERC-7201 namespaced storage. V2 added EIP-2612 permit (Sept 2025).",
      },
      {
        support: "coming-soon",
        chainName: "XRP Ledger",
        chain: "xrpl",
        contract: "524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
        explorerUrl: "https://livenet.xrpl.org/token/524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
        reason: "XRP Ledger IOU — XRPL RPC support coming soon.",
      },
    ],
  },

  // ── USD1 ──────────────────────────────────────────────────────────────────
  {
    symbol: "USD1",
    name: "World Liberty Financial USD1",
    issuer: "World Liberty Financial (WLFI)",
    hasComplianceControls: true,
    seizureNote:
      "Freeze capability present per contract source. No public documentation of an explicit seize/destroy mechanism — frozen balance status unclear.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        explorerUrl: "https://etherscan.io/token/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        rpcUrl: EVM_RPC_URLS.ethereum_c,
        checks: [
          {
            fnName: "frozen",
            selector: SELECTORS.frozen,
            type: "freeze",
            description: "Public mapping getter — returns true if the address has been frozen by the admin. Same Stablecoin.sol pattern as FDUSD.",
          },
        ],
        notes: "TransparentUpgradeableProxy (EIP-1967). 18 decimals. Same Stablecoin.sol base as FDUSD.",
      },
      {
        support: "evm",
        chainName: "BNB Chain",
        chain: "bnb",
        contract: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        explorerUrl: "https://bscscan.com/token/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        rpcUrl: EVM_RPC_URLS.bnb,
        checks: [
          {
            fnName: "frozen",
            selector: SELECTORS.frozen,
            type: "freeze",
            description: "Public mapping getter — returns true if the address has been frozen by the admin.",
          },
        ],
        notes: "Same contract address as Ethereum deployment.",
      },
    ],
  },

  // ── FDUSD ─────────────────────────────────────────────────────────────────
  {
    symbol: "FDUSD",
    name: "First Digital USD",
    issuer: "First Digital Trust Limited",
    hasComplianceControls: true,
    seizureNote:
      "freeze/unfreeze functions present. No evidence of a balance-destruction mechanism — frozen balance status unclear.",
    chains: [
      {
        support: "evm",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        explorerUrl: "https://etherscan.io/token/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        rpcUrl: EVM_RPC_URLS.ethereum_c,
        checks: [
          {
            fnName: "frozen",
            selector: SELECTORS.frozen,
            type: "freeze",
            description: "Public mapping getter (mapping(address => bool) public frozen). The notFrozen modifier blocks transfers and approvals for frozen addresses.",
          },
        ],
        notes: "TransparentUpgradeableProxy (EIP-1967). 18 decimals. Stablecoin.sol base — same pattern as USD1.",
      },
      {
        support: "evm",
        chainName: "BNB Chain",
        chain: "bnb",
        contract: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        explorerUrl: "https://bscscan.com/token/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        rpcUrl: EVM_RPC_URLS.bnb,
        checks: [
          {
            fnName: "frozen",
            selector: SELECTORS.frozen,
            type: "freeze",
            description: "Public mapping getter — returns true if the address has been frozen.",
          },
        ],
        notes: "Same contract address as Ethereum. Independent deployment — can diverge through separate upgrades.",
      },
    ],
  },

  // ── TUSD ──────────────────────────────────────────────────────────────────
  {
    symbol: "TUSD",
    name: "TrueUSD",
    issuer: "Techteryx Ltd.",
    hasComplianceControls: true,
    seizureNote:
      "Asset-protection freeze exists. $456M in reserves frozen by Dubai court order (Nov 2025).",
    chains: [
      {
        support: "coming-soon",
        chainName: "Ethereum",
        chain: "ethereum",
        contract: "0x0000000000085d4780B73119b644AE5ecd22b376",
        explorerUrl: "https://etherscan.io/token/0x0000000000085d4780B73119b644AE5ecd22b376",
        reason: "isBlacklisted mapping is declared without 'public' in ProxyStorage — no external getter was generated by the compiler. eth_call reverts. No accessible onchain compliance check on this contract.",
      },
      {
        support: "coming-soon",
        chainName: "BNB Chain",
        chain: "bnb",
        contract: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
        explorerUrl: "https://bscscan.com/token/0x14016E85a25aeb13065688cAFB43044C2ef86784",
        reason: "Same issue as Ethereum — isBlacklisted is not publicly callable on this deployment.",
      },
      {
        support: "coming-soon",
        chainName: "Avalanche",
        chain: "avalanche",
        contract: "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB",
        explorerUrl: "https://snowtrace.io/token/0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB",
        reason: "Same issue as Ethereum — isBlacklisted is not publicly callable on this deployment.",
      },
      {
        support: "coming-soon",
        chainName: "TRON",
        chain: "tron",
        contract: "TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4",
        explorerUrl: "https://tronscan.org/#/token20/TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4",
        reason: "TRC-20 — TRON RPC support coming soon.",
      },
    ],
  },

  // ── USDS ──────────────────────────────────────────────────────────────────
  {
    symbol: "USDS",
    name: "Sky USDS",
    issuer: "Sky Protocol",
    hasComplianceControls: false,
    noControlsReason:
      "Freeze function voted in by governance but NOT yet deployed on-chain as of this check. Will be added once active.",
    chains: [],
  },

  // ── DAI ───────────────────────────────────────────────────────────────────
  {
    symbol: "DAI",
    name: "Multi-Collateral Dai",
    issuer: "Sky Protocol (MakerDAO)",
    hasComplianceControls: false,
    noControlsReason:
      "Immutable contract — no admin freeze, blacklist, or seize capability. Fully permissionless transfers.",
    chains: [],
  },

  // ── USDe ──────────────────────────────────────────────────────────────────
  {
    symbol: "USDe",
    name: "Ethena USDe",
    issuer: "Ethena Labs",
    hasComplianceControls: false,
    noControlsReason:
      "No blacklist or freeze on the USDe token contract. Ethena uses permissioned minting (KYC/KYB for direct mint/redeem) but token transfers are permissionless.",
    chains: [],
  },

  // ── GHO ───────────────────────────────────────────────────────────────────
  {
    symbol: "GHO",
    name: "GHO",
    issuer: "Aave DAO",
    hasComplianceControls: false,
    noControlsReason:
      "Fully permissionless token transfers — no freeze, seize, or pause on the GHO token itself. Compliance handled at the Aave V3 market level, not the token.",
    chains: [],
  },

  // ── frxUSD ────────────────────────────────────────────────────────────────
  {
    symbol: "frxUSD",
    name: "Frax USD",
    issuer: "Frax Finance",
    hasComplianceControls: false,
    noControlsReason:
      "No blacklist or freeze function present in the frxUSD contract. Permissionless transfers.",
    chains: [],
  },
]
