import type { Eip } from "@/types/eip"

export const EIPS: Eip[] = [
  {
    id: "ERC-20",
    name: "Fungible token standard",
    category: "core",
    summary:
      "Base interface for all fungible tokens — transfer, approve, allowance, balanceOf, totalSupply",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-20",
  },
  {
    id: "EIP-712",
    name: "Typed structured data signing",
    category: "signature",
    summary:
      "Domain-separated typed message signing that binds signatures to a specific contract and chain ID, preventing cross-chain and cross-contract replay attacks",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-712",
  },
  {
    id: "EIP-2612",
    name: "Permit — gasless ERC-20 approval",
    category: "signature",
    summary:
      "Adds permit() to ERC-20 — users sign an approval off-chain, relayer submits on-chain. Eliminates the separate approve() transaction in DeFi flows",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-2612",
  },
  {
    id: "EIP-3009",
    name: "transferWithAuthorization",
    category: "signature",
    summary:
      "Signed atomic transfer (not just approval) with random bytes32 nonces — enables concurrent authorizations and single-transaction gasless payments",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-3009",
  },
  {
    id: "EIP-1967",
    name: "Standard proxy storage slots",
    category: "upgradeability",
    summary:
      "Standardises where proxy contracts store the implementation and admin addresses, enabling Etherscan and tooling to auto-detect proxies",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-1967",
  },
  {
    id: "EIP-1822",
    name: "UUPS — universal upgradeable proxy",
    category: "upgradeability",
    summary:
      "Upgrade logic lives in the implementation contract rather than the proxy. Cheaper to deploy than transparent proxies and easier to audit",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-1822",
  },
  {
    id: "ERC-4626",
    name: "Tokenized yield vault standard",
    category: "vault",
    summary:
      "Standard interface for yield-bearing vaults: deposit, withdraw, mint, redeem, convertToShares, convertToAssets. Any ERC-4626-aware protocol integrates automatically",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-4626",
  },
  {
    id: "EIP-1271",
    name: "Signature validation for smart contracts",
    category: "signature",
    summary:
      "isValidSignature() lets smart contract wallets (Safe multisig, Argent, AA wallets) verify signatures — enables permit flows for contracts, not just EOAs",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-1271",
  },
  {
    id: "ERC-7802",
    name: "Crosschain token interface",
    category: "cross-chain",
    summary:
      "Minimal interface for cross-chain mint/burn — standardises crosschainMint() and crosschainBurn() so any bridge can move tokens without wrapped representations",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-7802",
  },
  {
    id: "ERC-3156",
    name: "Flash loans",
    category: "flash",
    summary:
      "Standard interface for single-transaction borrow-use-repay flash loans — maxFlashLoan(), flashFee(), flashLoan(). Enables arbitrage, liquidation, and refinancing without upfront capital",
    eipsUrl: "https://eips.ethereum.org/EIPS/eip-3156",
  },
]
