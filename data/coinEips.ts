import type { CoinEipProfile, Eip, EipCategory } from "@/types/eip"

// ── Global EIP catalog (standards matrix) ───────────────────────────────────

export interface EipCategoryMeta {
  id: EipCategory
  title: string
}

/**
 * Canonical ordered list of EIP categories. Every page, matrix, and section
 * component should import this instead of maintaining a local copy.
 */
export const EIP_CATEGORIES: EipCategoryMeta[] = [
  { id: "core", title: "Core" },
  { id: "signature", title: "Signatures & typed data" },
  { id: "upgradeability", title: "Upgradeability & proxies" },
  { id: "vault", title: "Vaults & yield" },
  { id: "compliance", title: "Compliance" },
  { id: "cross-chain", title: "Cross-chain" },
  { id: "flash", title: "Flash Loans" },
]

export const EIP_CATEGORY_ORDER: EipCategory[] = EIP_CATEGORIES.map((c) => c.id)

export const EIP_CATEGORY_TITLES: Record<EipCategory, string> = Object.fromEntries(
  EIP_CATEGORIES.map((c) => [c.id, c.title]),
) as Record<EipCategory, string>

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
  {
    id: "Freeze",
    name: "Address freezing / blacklisting",
    category: "compliance",
    summary:
      "Issuer ability to freeze or blacklist individual addresses, preventing them from sending or receiving tokens. The most fundamental compliance capability for sanctions enforcement (OFAC/SDN) and law-enforcement cooperation.",
  },
  {
    id: "Seize",
    name: "Fund seizure / clawback",
    category: "compliance",
    summary:
      "Issuer ability to destroy or reclaim tokens from frozen/blacklisted addresses. Goes beyond freeze-in-place — the issuer can permanently remove tokens from circulation or redirect them. Critical for court-ordered asset recovery.",
  },
  {
    id: "Pause",
    name: "Global transfer pause",
    category: "compliance",
    summary:
      "Emergency circuit-breaker that halts ALL token transfers contract-wide. Used for critical security incidents, regulatory orders, or protocol-level emergencies. Affects every holder simultaneously.",
  },
]

// ── Per-coin EIP implementation profiles ──────────────────────────────────────

export const COIN_EIP_PROFILES: CoinEipProfile[] = [
  {
    symbol: "USDC",
    contractName: "FiatToken v2.2",
    decimals: 6,
    deployedBlock: 6082465,
    isUpgradeable: true,
    upgradePattern: "TransparentUpgradeableProxy (EIP-1967)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "FiatTokenV1 → FiatTokenV2 → FiatTokenV2_1 → FiatTokenV2_2",
        keyFunctions: [
          "transfer(address to, uint256 value) → bool",
          "transferFrom(address from, address to, uint256 value) → bool",
          "approve(address spender, uint256 value) → bool",
          "allowance(address owner, address spender) → uint256",
          "balanceOf(address account) → uint256",
          "totalSupply() → uint256",
        ],
        implementationNotes:
          "Standard ERC-20. v2.2 bit-packs balance and blacklist into a single storage slot (bit 255 = blacklist flag, bits 0-254 = balance) — saves ~6-7% gas on transfer/transferFrom. approve() requires allowance to be set to zero before changing to non-zero (double-spend guard). Transfer and approve are blocked for blacklisted addresses. Five-role admin architecture: admin (upgrades), owner (role assignment), masterMinter (mint allowances), pauser (global pause), blacklister (freeze addresses), plus a rescuer role for recovering tokens sent to the contract via rescueERC20().",
        devImpact:
          "Foundation interface. Every EVM wallet, DEX, and DeFi protocol interacts with USDC via this interface.",
        footguns:
          "The zero-first approve() requirement can cause failures in protocols that call approve(spender, newAmount) directly without checking current allowance. Use increaseAllowance() or set to 0 first.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "EIP712Domain.sol abstract contract",
        keyFunctions: ["DOMAIN_SEPARATOR() → bytes32"],
        typeHash:
          'keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")',
        implementationNotes:
          'Domain separator uses name = "USD Coin", version = "2", chainId, and verifyingContract (the proxy address). Stored in contract state and updated via _chainId() which reads the chainid() opcode — correctly handles chain forks. Used by both EIP-2612 permit and EIP-3009 transferWithAuthorization.',
        devImpact:
          "Prerequisite for all signature-based flows. Binds signatures to a specific contract address and chain ID — prevents signatures from being replayed on other chains or against other contracts.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "EIP2612.sol abstract contract",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
        ],
        typeHash:
          'keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)") = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9',
        implementationNotes:
          "Sequential per-owner nonce stored in _permitNonces[address] mapping. Nonce incremented on each successful call. Deadline enforced via block.timestamp. Signature recovered via ecrecover. Reverts on invalid signature, expired deadline, or blacklisted addresses. Contract address is the proxy address (not implementation).",
        devImpact:
          "Collapses the two-transaction approve + action DeFi flow into a single transaction. User signs off-chain, dApp or relayer submits permit() + the DeFi action in one call. Required for ERC-4337 paymaster flows and gasless onboarding.",
        footguns:
          "nonces() must be read from the proxy address, not the implementation. Front-running: a malicious actor can front-run your permitAndTransferFrom by submitting just the permit — use receiveWithAuthorization (EIP-3009) or ensure the permit + action are atomic.",
      },
      {
        eipId: "EIP-3009",
        status: "implemented",
        contractPattern: "EIP3009.sol abstract contract",
        keyFunctions: [
          "transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "authorizationState(address authorizer, bytes32 nonce) → bool",
        ],
        typeHash:
          'TRANSFER: keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)") = 0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267\nRECEIVE: keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")',
        implementationNotes:
          "Nonce is a random bytes32, tracked in _authorizationStates[authorizer][nonce] as a boolean. Unlike EIP-2612 sequential nonces, random nonces allow creating thousands of independent concurrent authorizations without ordering conflicts. cancelAuthorization lets the signer void a pending authorization before it is used.",
        devImpact:
          "Preferred over EIP-2612 for payment use cases: (1) atomic — the transfer happens in one call, no separate transferFrom needed; (2) random nonces allow concurrent payment authorizations from the same address; (3) validAfter/validBefore enables scheduled and time-bounded payments; (4) cancelAuthorization enables refund and reversal patterns.",
        footguns:
          "Use receiveWithAuthorization (not transferWithAuthorization) when calling from a smart contract — prevents a mempool attacker from front-running the authorization and extracting the transfer before your contract logic runs. Dedicate leading bytes of the nonce as a function identifier when a contract accepts multiple authorization types.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "TransparentUpgradeableProxy",
        keyFunctions: [
          "upgradeTo(address newImplementation) — admin only",
          "upgradeToAndCall(address newImplementation, bytes calldata data) — admin only",
          "implementation() → address",
          "admin() → address",
        ],
        implementationNotes:
          'Implementation address at slot bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1). Admin at bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1). Current implementation: FiatTokenV2_2. All state (balances, allowances, blacklist) lives in the proxy. The implementation is stateless logic only. Etherscan auto-detects this pattern and shows implementation ABI.',
        devImpact:
          "Allows Circle to patch bugs and add features without requiring a token migration. The EIP-1967 standard means block explorers, risk tools (Tenderly, Forta), and monitoring systems automatically detect the proxy and show the correct ABI.",
        footguns:
          "Always interact with the PROXY address, not the implementation address. The implementation has no balances and calls to it will not behave as expected. Check that your integration uses the proxy address in your constants.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "TransparentUpgradeableProxy — upgrade logic in ProxyAdmin, not implementation",
        keyFunctions: [],
        implementationNotes:
          "USDC uses TransparentUpgradeableProxy (EIP-1967), not UUPS. The upgrade authorization and admin role live in a separate ProxyAdmin contract, not the FiatToken implementation. This is distinct from EIP-1822.",
        devImpact:
          "No behavioral impact for token users. Relevant for forks: if you deploy a USDC-compatible token using UUPS, the upgrade mechanism differs from Circle's production deployment.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "Not a vault token",
        keyFunctions: [],
        implementationNotes:
          "USDC is a payment stablecoin — no ERC-4626 interface on the canonical FiatToken. Yield on USDC is provided by external protocols (Aave aUSDC, Compound cUSDC, Morpho, etc.) that wrap USDC in their own ERC-4626 vaults.",
        devImpact:
          "To build yield-bearing USDC products, integrate with Aave, Compound, or other ERC-4626 yield wrappers — do not expect deposit/withdraw/convertToAssets on the canonical USDC address.",
      },
      {
        eipId: "EIP-1271",
        status: "implemented",
        contractPattern: "FiatTokenV2_2 — EIP-1271 isValidSignature",
        keyFunctions: ["isValidSignature(bytes32 hash, bytes signature) → bytes4"],
        implementationNotes:
          "Added in v2.2 (November 2023). Returns magic value 0x1626ba7e when signature is valid. Enables smart contract wallets (Safe multisig, Argent, ERC-4337 accounts) to act as signers for permit(), transferWithAuthorization(), receiveWithAuthorization(), and cancelAuthorization(). This was a key enabler for account abstraction and ERC-4337 paymaster flows with USDC.",
        devImpact:
          "Institutional flows where the USDC holder is a Safe or AA wallet can now use signature-based permit flows directly. Previously required Permit2 or EOA co-signer workarounds.",
      },
      {
        eipId: "ERC-7802",
        status: "alternative",
        contractPattern: "USDC uses CCTP v2 (proprietary), not ERC-7802",
        keyFunctions: [],
        implementationNotes:
          "Circle's cross-chain model is CCTP v2 — a proprietary burn-and-mint protocol with Circle's off-chain attestation service (Iris). Unlike ERC-7802's standardised crosschainMint/crosschainBurn interface, CCTP uses TokenMessengerV2 and MessageTransmitterV2 contracts with fast finality (~20s Ethereum, ~8s L2s) and hooks for atomic post-transfer actions.",
        devImpact:
          "USDC cross-chain transfers use CCTP, not any open ERC-7802 bridge interface. Integrators must use Circle's SDK and contracts.",
        alternativeStandard: "CCTP v2",
        alternativeNotes:
          "Circle Cross-Chain Transfer Protocol — proprietary burn-and-mint with off-chain attestation. Achieves the same cross-chain fungibility goal as ERC-7802 through a different mechanism.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on canonical USDC",
        keyFunctions: [],
        implementationNotes:
          "USDC has no native flash loan or flash mint capability. Flash loans of USDC are available through external protocols (Aave, dYdX, Balancer) that hold USDC liquidity.",
        devImpact:
          "Use Aave or Balancer flash loan pools for single-transaction USDC borrowing.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "FiatTokenV2_2 — blacklister role, bit-packed storage",
        keyFunctions: [
          "blacklist(address _account) — blacklister only",
          "unBlacklist(address _account) — blacklister only",
          "isBlacklisted(address _account) → bool",
        ],
        implementationNotes:
          "FiatToken v2.2 bit-packs the blacklist flag into the same storage slot as the balance (bit 255 = blacklist, bits 0-254 = balance). Blacklisted addresses cannot call transfer(), transferFrom(), approve(), or be the recipient of transfers. The blacklister role is separate from the admin, owner, and pauser — five-role architecture limits blast radius of compromised keys.",
        devImpact:
          "Always check isBlacklisted() before building payment pipelines that depend on USDC. Blacklisting is immediate and affects both sending and receiving. Etherscan shows blacklist events — monitor for operational awareness.",
        footguns:
          "Blacklisted addresses still hold their balance — funds are frozen in place, not destroyed. If your protocol holds USDC in a single contract address and that address gets blacklisted, all funds in the contract are frozen.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "Freeze only — no destruction or transfer of frozen funds",
        keyFunctions: [],
        implementationNotes:
          "USDC's compliance model is freeze-in-place only. Circle cannot destroy or transfer tokens from blacklisted addresses. This is a deliberate design choice — funds remain on-chain and visible, and can potentially be unblacklisted if the legal situation resolves. Contrast with USDT's destroyBlackFunds() which permanently burns frozen balances.",
        devImpact:
          "Frozen USDC remains in totalSupply() and balanceOf() — supply tracking is unaffected by freezes. No surprise supply changes from seizure events.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "FiatTokenV1 — pauser role, Pausable modifier",
        keyFunctions: [
          "pause() — pauser only",
          "unpause() — pauser only",
          "paused() → bool",
        ],
        implementationNotes:
          "Global pause halts ALL transfer(), transferFrom(), approve(), mint(), and burn() operations. The pauser role is dedicated and separate from other admin roles. Circle has never activated a global pause on Ethereum mainnet USDC. The pause mechanism exists as a nuclear option for extreme scenarios (critical vulnerability, regulatory order).",
        devImpact:
          "DeFi protocols that hold USDC should account for the possibility of a global pause in their risk models. A pause would freeze all USDC-dependent operations including DEX swaps, lending, and collateral liquidations.",
        footguns:
          "A global pause affects EVERY holder and protocol simultaneously. During a pause, liquidation mechanisms that depend on USDC transfers would fail, potentially cascading into bad debt for lending protocols.",
      },
    ],
  },

  {
    symbol: "USDT",
    contractName: "TetherToken",
    decimals: 6,
    deployedBlock: 4634748,
    isUpgradeable: true,
    upgradePattern: "Custom deprecate() delegation (NOT EIP-1967)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "partial",
        contractPattern: "StandardToken → TetherToken (Solidity 0.4.x)",
        keyFunctions: [
          "transfer(address _to, uint _value)",
          "transferFrom(address _from, address _to, uint _value)",
          "approve(address _spender, uint _value) — non-standard: reverts if current allowance != 0 AND new value != 0",
          "allowance(address _owner, address _spender) → uint",
          "balanceOf(address who) → uint",
          "totalSupply() → uint",
          "issue(uint amount) — owner only, mints to owner",
          "redeem(uint amount) — owner only, burns from owner",
          "setParams(uint newBasisPoints, uint newMaxFee) — fee config, currently 0/0",
          "deprecate(address _upgradedAddress) — owner only",
          "destroyBlackFunds(address _blackListedUser) — owner only, destroys tokens",
        ],
        implementationNotes:
          "Written in Solidity 0.4.x with THREE critical ERC-20 deviations: (1) transfer(), transferFrom(), and approve() do NOT return bool — they return void, breaking any contract that uses the standard IERC20 interface. OpenZeppelin SafeERC20 with safeTransfer/safeTransferFrom/forceApprove is REQUIRED. (2) approve() race condition guard — requires allowance be set to 0 before setting a non-zero value. (3) Contains onlyPayloadSize modifier for obsolete short-address attack defence. Contains a dormant fee-on-transfer mechanism (basisPointsRate, maximumFee) set to 0 but activatable by owner via setParams(). Also has destroyBlackFunds() which burns the entire balance of blacklisted addresses — more aggressive than USDC's freeze-in-place approach.",
        devImpact:
          "Most liquid stablecoin but worst DeFi UX due to non-standard approve(). Every approve() call in a standard ERC-20 integration requires a two-step zero-first pattern for USDT, or the transaction reverts silently.",
        footguns:
          "FOUR major footguns: (1) transfer/transferFrom/approve return void, not bool — any IERC20 cast reverts. Use SafeERC20 safeTransfer/safeTransferFrom/forceApprove. (2) approve() reverts if allowance is non-zero — always approve(spender, 0) first, or use forceApprove(). (3) Dormant fee-on-transfer (basisPointsRate/maximumFee) can be activated without warning — always use balanceBefore/balanceAfter pattern. (4) destroyBlackFunds() burns blacklisted balances without standard Burn event — supply tracking tools must account for this.",
      },
      {
        eipId: "EIP-712",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "The Ethereum USDT contract was deployed in 2017, predating EIP-712. It has never been upgraded to include typed data signing. Tether has publicly stated it has no current plans to add EIP-712, EIP-2612, or EIP-3009 to the Ethereum deployment.",
        devImpact:
          "USDT cannot participate in any signature-based approval or transfer flow on Ethereum. Every DeFi interaction requires two on-chain transactions (approve + action). This is the single largest UX gap vs USDC for developers building payment applications.",
      },
      {
        eipId: "EIP-2612",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "No permit() function. Workaround: Uniswap Permit2 (0x000000000022D473030F116dDEE9F6B43aC78BA3) can provide permit-style signatures for USDT, but requires a one-time approve() to the Permit2 contract first.",
        devImpact:
          "Cannot build gasless USDT flows without Permit2 as an intermediary or wrapping into a protocol-specific contract.",
        footguns:
          "If using Permit2 with USDT: the one-time approve() to Permit2 must succeed (apply the zero-first pattern). The Permit2 allowance is separate from the USDT allowance — do not conflate them.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "No transferWithAuthorization. The canonical Ethereum USDT contract has no mechanism for atomic signed transfers.",
        devImpact:
          "USDT cannot be used in single-transaction payment flows. Protocols that build on EIP-3009 (like payment relayers and checkout flows) must either exclude USDT or require users to pre-approve.",
      },
      {
        eipId: "EIP-1967",
        status: "not-implemented",
        contractPattern: "Custom deprecate() pattern",
        keyFunctions: ["deprecate(address _upgradedAddress) — owner only"],
        implementationNotes:
          "USDT uses a custom upgrade mechanism: the owner calls deprecate(newAddress), which sets a deprecated flag and stores the new contract address. All subsequent transfer/approve calls check deprecated and delegate to the new contract via the UpgradedStandardToken interface. This is NOT EIP-1967 — the implementation address is not stored in standard slots.",
        devImpact:
          "Block explorers do not auto-detect USDT as a proxy. Etherscan shows the original 2017 ABI unless you manually find the current contract. Monitoring tools that watch standard EIP-1967 slots will miss USDT upgrades entirely.",
        footguns:
          "Always check the deprecated() flag and deprecatedAndUpgradeTo() address when integrating — you may be calling the old contract if you cached the original address years ago.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "Not applicable — custom deprecate() delegation pattern",
        keyFunctions: [],
        implementationNotes:
          "USDT uses a bespoke owner-controlled deprecation mechanism, entirely separate from UUPS or any proxy standard.",
        devImpact:
          "No UUPS considerations apply to USDT. The upgrade path is the custom deprecate() function documented in the EIP-1967 entry above.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "Not a vault token",
        keyFunctions: [],
        implementationNotes:
          "USDT is a payment token; no ERC-4626 vault interface exists on the canonical TetherToken contract.",
        devImpact:
          "Use external protocols (Aave aUSDT, Compound cUSDT) for yield-bearing USDT positions.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "No isValidSignature on TetherToken. This is largely moot given USDT also lacks EIP-712, EIP-2612, and EIP-3009 — smart-wallet signature flows are blocked at those earlier layers.",
        devImpact:
          "Smart-wallet permit flows are blocked upstream by USDT's lack of signature standards, not EIP-1271 specifically.",
      },
      {
        eipId: "ERC-7802",
        status: "implemented",
        contractPattern: "USDT0 — TetherTokenOFTExtension + ArbitrumExtensionV2 via LayerZero OFT",
        keyFunctions: [
          "crosschainMint(address to, uint256 amount) — bridge-authorized",
          "crosschainBurn(address from, uint256 amount) — bridge-authorized",
        ],
        implementationNotes:
          "USDT0 (launched January 2025) adopts the draft ERC-7802 Crosschain Token Interface on top of LayerZero's OFT standard. Enables native burn-and-mint cross-chain transfers across 15+ networks without wrapped tokens. ArbitrumExtensionV2 facilitates migration of existing Arbitrum USDT to the OFT standard. OpenZeppelin audited Jan-May 2025 with no critical findings. Over $50B moved via USDT0 within months of launch.",
        devImpact:
          "For cross-chain USDT transfers, USDT0 OFT is the official path — no bridge wrappers needed. ERC-7802 crosschainMint/crosschainBurn events enable deterministic indexing by off-chain agents.",
        footguns:
          "ERC-7802 is still a DRAFT standard — interfaces may change. Only bridge-authorized addresses can call crosschainMint/crosschainBurn. Legacy bridged USDT on some chains is NOT the same as USDT0 — verify which contract you interact with.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on canonical USDT",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan capability. Flash loans of USDT available through external protocols (Aave, Balancer).",
        devImpact:
          "Use external flash loan providers for single-transaction USDT borrowing.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "TetherToken — owner-controlled blacklist",
        keyFunctions: [
          "addBlackList(address _evilUser) — owner only",
          "removeBlackList(address _clearedUser) — owner only",
          "getBlackListStatus(address _maker) → bool",
          "isBlackListed(address) → bool (public mapping)",
        ],
        implementationNotes:
          "Single-owner blacklist model — the contract owner can freeze any address. Blacklisted addresses cannot call transfer() or transferFrom(). Unlike USDC's dedicated blacklister role, USDT's owner has all admin powers (pause, blacklist, upgrade, fee changes) concentrated in one key.",
        devImpact:
          "Same integration consideration as USDC: check isBlackListed() before building payment flows. The single-owner model means blacklisting power cannot be delegated independently.",
        footguns:
          "The owner key controls everything: blacklist, pause, upgrade, fee activation, and destroyBlackFunds. If compromised, the attacker has full control over all compliance and supply functions.",
      },
      {
        eipId: "Seize",
        status: "implemented",
        contractPattern: "TetherToken — destroyBlackFunds burns frozen balances",
        keyFunctions: [
          "destroyBlackFunds(address _blackListedUser) — owner only",
        ],
        implementationNotes:
          "The most aggressive compliance mechanism among top stablecoins. destroyBlackFunds() permanently burns the entire balance of a blacklisted address, reducing totalSupply(). Emits a DestroyedBlackFunds event (not a standard Transfer or Burn event). This is a one-way, irreversible operation — the tokens are destroyed, not transferred to Tether. Used for sanctions enforcement and law-enforcement cooperation.",
        devImpact:
          "Supply tracking tools MUST listen for DestroyedBlackFunds events — standard ERC-20 event monitoring will miss these supply changes. totalSupply() decreases when funds are seized.",
        footguns:
          "destroyBlackFunds() does NOT emit a standard Transfer(from, address(0), amount) event — it uses a custom DestroyedBlackFunds(address, uint) event. Any indexer relying solely on Transfer events for supply tracking will have an incorrect total. The address must be blacklisted first — calling destroyBlackFunds on a non-blacklisted address reverts.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "TetherToken — Pausable inheritance, owner-controlled",
        keyFunctions: [
          "pause() — owner only",
          "unpause() — owner only",
          "paused() → bool (public variable, named 'paused')",
        ],
        implementationNotes:
          "Inherits from OpenZeppelin-style Pausable. When paused, transfer(), transferFrom(), and issue() revert. The pause power is held by the same owner key that controls blacklisting, supply, and upgrades. Tether has never activated a global pause on Ethereum mainnet.",
        devImpact:
          "Same risk model as USDC pause — all USDT-dependent DeFi would halt. The concentrated owner key means pause decisions are made by a single entity without multi-sig or timelock requirements.",
      },
    ],
  },

  {
    symbol: "DAI",
    contractName: "dai.sol (MCD)",
    decimals: 18,
    deployedBlock: 8928158,
    isUpgradeable: false,
    upgradePattern: "None — immutable contract",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "DS-Token pattern",
        keyFunctions: [
          "transfer(address dst, uint wad) → bool",
          "transferFrom(address src, address dst, uint wad) → bool",
          "approve(address usr, uint wad) → bool",
          "allowance(address owner, address spender) → uint",
          "balanceOf(address) → uint",
          "totalSupply() → uint",
          "push(address usr, uint wad)       — alias for transferFrom(msg.sender, usr, wad)",
          "pull(address usr, uint wad)       — alias for transferFrom(usr, msg.sender, wad)",
          "move(address src, address dst, uint wad) — alias for transferFrom(src, dst, wad)",
          "mint(address usr, uint wad) — auth only",
          "burn(address usr, uint wad) — auth only",
          "rely(address usr)  — add ward (auth only)",
          "deny(address usr)  — remove ward (auth only)",
        ],
        implementationNotes:
          "Three notable deviations from standard ERC-20: (1) if src == msg.sender, transferFrom() bypasses allowance check — acts as direct transfer; (2) MAX_UINT allowance is treated as infinite — never decremented on transferFrom; (3) push/pull/move aliases for common vault patterns. Ward/auth system (rely/deny) controls who can mint and burn — the Vat contract is the primary ward.",
        devImpact:
          "The MAX_UINT infinite allowance pattern means protocols that approve DAI once for MAX_UINT do not need repeated approvals. The src == msg.sender shortcut simplifies vault integration patterns where users call the vault directly without prior approval.",
        footguns:
          "Do not rely on Approval events to track DAI allowances — infinite approvals are set via approve(spender, MAX_UINT) and are never emitted again when used. The src == msg.sender bypass can cause confusion: calling transferFrom(userAddress, vault, amount) from the user's EOA (not a contract) works without approval.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "Inline in dai.sol constructor",
        keyFunctions: ["DOMAIN_SEPARATOR — public immutable bytes32"],
        typeHash:
          'keccak256(abi.encode(keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"), keccak256("Dai Stablecoin"), keccak256("1"), chainId, address(this)))',
        implementationNotes:
          'Computed in the constructor (not an initializer — DAI is not upgradeable). Uses name = "Dai Stablecoin", version = "1". This was one of the earliest token EIP-712 implementations and predates the finalised standard — it shaped the specification.',
        devImpact:
          "Prerequisite for the permit() function. DAI was a major reference implementation for EIP-712 adoption in the DeFi ecosystem.",
      },
      {
        eipId: "EIP-2612",
        status: "partial",
        contractPattern: "Custom permit() in dai.sol — predates EIP-2612 finalisation",
        keyFunctions: [
          "permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address) → uint",
        ],
        typeHash:
          'keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)") — NOTE: different field names and types vs EIP-2612 standard',
        implementationNotes:
          "DAI permit has TWO ABI-breaking differences from EIP-2612: (1) value parameter is bool allowed, not uint256 value — setting allowed=true sets allowance to MAX_UINT, allowed=false sets to 0. No granular amount supported. (2) deadline parameter is named expiry (different name, same semantics). These differences mean you CANNOT use standard EIP-2612 ABI encoders (OpenZeppelin, ethers.js permitABI) with DAI without DAI-specific handling.",
        devImpact:
          "DAI invented permit-based approvals but its ABI is incompatible with the standard that followed. Any integration with both USDC-style and DAI permit needs two separate code paths.",
        footguns:
          "CRITICAL: do not pass a uint256 amount to DAI permit() — the function takes bool. Passing a uint256 where bool is expected will not revert but will silently coerce to either true (non-zero) or false (zero). The nonce parameter is positional (3rd arg in DAI vs last in EIP-2612). Always write a DAI-specific permit helper rather than reusing a generic EIP-2612 helper.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "DAI has no transferWithAuthorization. The immutable contract cannot be extended.",
        devImpact:
          "Building atomic single-transaction payment flows with DAI requires an intermediary contract that calls permit() then transferFrom() atomically. The DAI immutability means this gap is permanent.",
      },
      {
        eipId: "EIP-1967",
        status: "not-implemented",
        contractPattern: "None — immutable contract, no proxy",
        keyFunctions: [],
        implementationNotes:
          "DAI is deployed as a plain immutable contract. The address 0x6B175474E89094C44Da98b954EedeAC495271d0F IS the complete implementation. No upgrade path exists.",
        devImpact:
          "Immutability is a trust property: no entity (including Sky Protocol governance) can change the DAI contract logic. For protocols that require maximum stability of their token dependency, this is valuable. Trade-off: bugs cannot be patched, features cannot be added.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "Not applicable — immutable contract, no proxy of any kind",
        keyFunctions: [],
        implementationNotes:
          "DAI is an immutable contract with no proxy. Neither UUPS nor TransparentProxy patterns apply. Upgrade path does not exist by design.",
        devImpact:
          "Immutability eliminates upgrade risk entirely. No UUPS considerations apply.",
      },
      {
        eipId: "ERC-4626",
        status: "alternative",
        contractPattern: "Not on base DAI — DSR Pot.sol predates ERC-4626, but sDAI wraps it",
        keyFunctions: [],
        implementationNotes:
          "The DAI ERC-20 is not a vault. The DAI Savings Rate uses Pot.sol with a non-standard interface that predates ERC-4626. sDAI — the ERC-4626 wrapper over DSR — is a separate contract deployed by Spark Protocol and is not part of the canonical DAI token.",
        devImpact:
          "For ERC-4626 yield on DAI, integrate with sDAI (Spark Protocol) or migrate to USDS/sUSDS. Do not expect deposit/withdraw/convertToAssets on the canonical DAI address.",
        alternativeStandard: "sDAI (Spark Protocol)",
        alternativeNotes:
          "sDAI is an official ecosystem ERC-4626 vault wrapper over the DAI Savings Rate (DSR). Deployed by Spark Protocol — provides standard deposit/withdraw/convertToAssets on a separate contract, channelling Pot.sol yield.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not present on immutable dai.sol",
        keyFunctions: [],
        implementationNotes:
          "No isValidSignature on DAI. Immutability means this cannot be added. Smart contract wallets can still use DAI's custom permit() via EOA co-signers but require DAI-specific ABI handling due to non-standard bool signature.",
        devImpact:
          "Contract wallets must use EOA co-signers or off-chain message flows for DAI permit. Migrate to USDS if EIP-1271 smart-wallet support is a requirement.",
      },
      {
        eipId: "ERC-3156",
        status: "implemented",
        contractPattern: "DssFlash module — ERC-3156 flash mint",
        keyFunctions: [
          "maxFlashLoan(address token) → uint256",
          "flashFee(address token, uint256 amount) → uint256",
          "flashLoan(IERC3156FlashBorrower receiver, address token, uint256 amount, bytes calldata data) → bool",
        ],
        implementationNotes:
          "DAI is the ONLY major stablecoin with native ERC-3156 flash loans via the DssFlash module (0x60744434d6339a6B27d73d9Eda62b6F66a0a04FA). Anyone can mint DAI up to a governance-set ceiling, use it within the same transaction, and repay + fee. Fee goes to the vow (protocol surplus). Supports both ERC-20 DAI and internal Vat DAI operations. Includes reentrancy guard protection.",
        devImpact:
          "Unique DeFi primitive — enables arbitrage, liquidation, and refinancing without upfront capital. No other stablecoin in the top 10 offers native flash minting. DssFlash democratizes MEV by making flash liquidity available to anyone, not just protocols with pre-funded pools.",
        footguns:
          "Flash mint ceiling is governance-controlled and can change. The fee (toll) is also governance-set — check both before building automated strategies. The borrowed DAI must be returned in the SAME transaction or the entire call reverts.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern: "Immutable contract — cannot add cross-chain interfaces",
        keyFunctions: [],
        implementationNotes:
          "DAI is an immutable contract with no proxy. ERC-7802 cross-chain mint/burn cannot be added. L2 DAI uses canonical bridges (Arbitrum/Optimism native bridges) not burn-and-mint standards.",
        devImpact:
          "Cross-chain DAI relies on canonical L2 bridges, not a standardised cross-chain token interface.",
      },
      {
        eipId: "Freeze",
        status: "not-implemented",
        contractPattern: "Immutable contract — no freeze capability by design",
        keyFunctions: [],
        implementationNotes:
          "DAI is a fully immutable contract with no admin functions for freezing or blacklisting addresses. This is a deliberate design principle — DAI was built as a censorship-resistant, permissionless stablecoin. No entity, including Sky Protocol governance, can freeze DAI addresses. This immutability is both DAI's greatest trust property and its most significant compliance limitation.",
        devImpact:
          "DAI cannot comply with address-level sanctions enforcement at the protocol level. Compliance must be enforced at the application layer (exchanges, front-ends) rather than the token contract. For institutional use cases requiring freeze capability, USDS was created as the upgradeable successor.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "Immutable contract — no seizure mechanism",
        keyFunctions: [],
        implementationNotes:
          "No mechanism exists to destroy or reclaim DAI from any address. The immutable contract has no admin, no owner, and no privileged roles that could enact seizure. Ward/auth system controls only mint and burn through the MCD protocol — not arbitrary balance manipulation.",
        devImpact:
          "DAI balances are sovereign — no external party can remove them. This is a feature for censorship resistance but a limitation for regulated institutional flows.",
      },
      {
        eipId: "Pause",
        status: "not-implemented",
        contractPattern: "Immutable contract — no pause mechanism",
        keyFunctions: [],
        implementationNotes:
          "DAI has no global pause function. Transfers cannot be halted at the token level. The MCD protocol can halt new DAI minting via emergency shutdown (End.sol), but existing DAI remains freely transferable. Emergency shutdown converts DAI claims to underlying collateral — it does not pause transfers.",
        devImpact:
          "DAI transfers will always work as long as the Ethereum network is operational. No single entity can halt DAI movement. MCD emergency shutdown affects minting/CDP operations, not transfer().",
      },
    ],
  },

  {
    symbol: "USDS",
    contractName: "USDS + sUSDS (Sky Protocol)",
    decimals: 18,
    deployedBlock: 20690000,
    isUpgradeable: true,
    upgradePattern: "ERC1967Proxy (USDS) + UUPS EIP-1822 (sUSDS)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "OpenZeppelin ERC20 v5 base via ERC1967Proxy",
        keyFunctions: [
          "Standard ERC-20 interface",
          "mint(address usr, uint256 wad) — ward only",
          "burn(address usr, uint256 wad) — ward only",
          "rely(address usr) — ward only",
          "deny(address usr) — ward only",
        ],
        implementationNotes:
          "Standard ERC-20 with DS-Auth ward pattern for mint/burn, inherited from DAI/MakerDAO architecture. The token address is the ERC1967Proxy. No blacklist, no pause, no fee-on-transfer. DaiUsds.sol is a ward and calls mint when DAI is deposited and burn when USDS is redeemed.",
        devImpact:
          "Clean standard ERC-20 with no compliance extensions. Governance can add a freeze function via upgrade if voted in — the proxy pattern makes this possible.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "OpenZeppelin EIP712 v5 in implementation contract",
        keyFunctions: [
          "DOMAIN_SEPARATOR() → bytes32",
          "eip712Domain() → (bytes1, string, string, uint256, address, bytes32, uint256[])",
        ],
        implementationNotes:
          'Uses OpenZeppelin v5 EIP712 implementation. Domain: name = "USDS Stablecoin", version = "1". Computed in the initialize() function (not constructor — proxy pattern requires initializer). eip712Domain() implements EIP-5267 for on-chain domain discovery.',
        devImpact:
          "Full EIP-712 compliance with EIP-5267 discovery. Tools and wallets can query the contract for its domain parameters rather than hardcoding them.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "OpenZeppelin ERC20Permit v5",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
        ],
        typeHash:
          'keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)") — standard EIP-2612 ABI, compatible with all standard tooling',
        implementationNotes:
          "Standard EIP-2612 ABI — unlike DAI, uses uint256 value (not bool) and deadline (not expiry). Fully compatible with OpenZeppelin, ethers.js, and viem EIP-2612 helpers without modification. Sequential per-owner nonces.",
        devImpact:
          "Drop-in replacement for USDC permit() flows — same ABI, same function signatures. Any integration that supports USDC EIP-2612 works with USDS without code changes.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present on USDS",
        keyFunctions: [],
        implementationNotes:
          "USDS is built on OpenZeppelin ERC20Permit v5, which implements EIP-2612 but not EIP-3009. No transferWithAuthorization or receiveWithAuthorization exists on the USDS token. A Sky governance upgrade could add this in future.",
        devImpact:
          "Payment relayers that require atomic signed transfers must compose permit() + transferFrom() for USDS. If EIP-3009 is a hard requirement, USDC or PYUSD are the appropriate alternatives.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "OpenZeppelin ERC1967Proxy v5",
        keyFunctions: [
          "upgradeTo(address newImplementation) — admin only",
          "upgradeToAndCall(address, bytes) — admin only",
        ],
        implementationNotes:
          "USDS proxy uses ERC1967Proxy. Implementation address stored at standard slot. Upgrade requires on-chain governance spell with timelock. All ERC-20 state (balances, nonces, wards) lives in the proxy storage. Etherscan auto-detects and shows implementation ABI.",
        devImpact:
          "Allows Sky Protocol to add features (freeze function, cross-chain extensions) via governance without token migration. Standard proxy slots mean monitoring tools work out of the box.",
        footguns:
          "Upgrades are governed by SKY token holders via spells — there is a timelock but no permanent immutability guarantee. Unlike DAI, the contract logic CAN change.",
      },
      {
        eipId: "EIP-1822",
        status: "implemented",
        contractPattern: "UUPS in sUSDS implementation contract",
        keyFunctions: [
          "_authorizeUpgrade(address newImplementation) — internal, auth-gated",
          "upgradeTo(address newImplementation) — routed through UUPSUpgradeable",
        ],
        implementationNotes:
          "sUSDS uses UUPS pattern (EIP-1822) rather than transparent proxy. Upgrade logic is in the implementation, not the proxy. _authorizeUpgrade checks the ward system. Lower gas cost to deploy and call than transparent proxy. ERC-1967 storage slots are still used for the implementation address.",
        devImpact:
          "UUPS is the current OpenZeppelin recommendation for new deployments. Cheaper proxies reduce deployment cost for protocols that fork or wrap sUSDS.",
      },
      {
        eipId: "ERC-4626",
        status: "implemented",
        contractPattern: "sUSDS.sol — full ERC-4626 vault implementation",
        keyFunctions: [
          "deposit(uint256 assets, address receiver) → uint256 shares",
          "mint(uint256 shares, address receiver) → uint256 assets",
          "withdraw(uint256 assets, address receiver, address owner) → uint256 shares",
          "redeem(uint256 shares, address receiver, address owner) → uint256 assets",
          "convertToShares(uint256 assets) → uint256",
          "convertToAssets(uint256 shares) → uint256",
          "totalAssets() → uint256",
          "asset() → address",
          "maxDeposit(address) → uint256",
          "maxMint(address) → uint256",
          "maxWithdraw(address owner) → uint256",
          "maxRedeem(address owner) → uint256",
          "previewDeposit(uint256 assets) → uint256",
          "previewMint(uint256 shares) → uint256",
          "previewWithdraw(uint256 assets) → uint256",
          "previewRedeem(uint256 shares) → uint256",
        ],
        implementationNotes:
          "Asset = USDS, share = sUSDS. Exchange rate accrues via an internal chi rate accumulator updated by drip(). Critically, convertToAssets() calculates the theoretical current chi on-the-fly — returns accurate values even if drip() has not been called recently. This is essential for DeFi composability where stale pricing would be dangerous. No lockup — instant deposit and redemption. No fees assessed, and fees CANNOT be enabled in the future (encoded in contract, not just policy). Emits both ERC-20 Transfer and ERC-4626 Deposit/Withdraw events.",
        devImpact:
          "Any protocol that integrates the ERC-4626 interface (Aave, Compound, Yearn, Gearbox, EigenLayer) gets sUSDS support automatically. This is the single biggest advantage of sUSDS over DAI's DSR — the DSR has no standard interface, requiring custom integrations per protocol.",
        footguns:
          "ERC-4626 emits Deposit and Withdraw events in addition to ERC-20 Transfer. Protocols that only index Transfer events will miss deposit/withdrawal context. convertToShares and convertToAssets are rounding-direction sensitive — use previewDeposit/previewRedeem for user-facing quotes.",
      },
      {
        eipId: "EIP-1271",
        status: "implemented",
        contractPattern: "OpenZeppelin EIP1271 in USDS implementation",
        keyFunctions: [
          "isValidSignature(bytes32 hash, bytes calldata signature) → bytes4",
        ],
        implementationNotes:
          "Returns magic value 0x1626ba7e if the signature is a valid EIP-712 permit signature for this contract. Enables Safe multisigs, Argent wallets, and ERC-4337 smart accounts to sign permits on behalf of USDS holdings.",
        devImpact:
          "Without EIP-1271, permit() only works for EOA private keys. With it, any smart contract wallet or institutional custody solution (Safe, Fireblocks smart contract wallet) can sign USDS permits — critical for institutional DeFi adoption.",
      },
      {
        eipId: "ERC-7802",
        status: "alternative",
        contractPattern: "USDS uses Wormhole NTT, not ERC-7802",
        keyFunctions: [],
        implementationNotes:
          "USDS expanded to Solana via Wormhole's Native Token Transfers (NTT) framework with burn-and-mint mechanics and built-in rate-limiting. This is a third cross-chain paradigm distinct from both CCTP (USDC) and OFT/ERC-7802 (USDT). Governance could add ERC-7802 support via proxy upgrade.",
        devImpact:
          "Multi-chain USDS uses Wormhole NTT — integrators must use the Portal bridge (portalbridge.com) and NTT SDK, not ERC-7802 interfaces.",
        alternativeStandard: "Wormhole NTT",
        alternativeNotes:
          "Wormhole Native Token Transfers — burn-and-mint with built-in rate-limiting. Fulfils cross-chain fungibility without the ERC-7802 interface.",
      },
      {
        eipId: "ERC-3156",
        status: "alternative",
        contractPattern: "No native flash mint — uses DAI DssFlash + DaiUsds converter",
        keyFunctions: [],
        implementationNotes:
          "The DssFlash module only mints DAI, not USDS. For flash liquidity in USDS, convert via DaiUsds.sol: flash-mint DAI → convert to USDS → use → convert back → repay DAI. This adds gas cost vs native flash mint but is technically viable.",
        devImpact:
          "No native USDS flash loans. Use the DAI flash mint + DaiUsds conversion path as a workaround.",
        alternativeStandard: "DssFlash + DaiUsds",
        alternativeNotes:
          "Flash-mint DAI via DssFlash (ERC-3156) then convert to USDS via the official DaiUsds.sol converter in a single transaction. Issuer-ecosystem path — not a direct ERC-3156 interface on USDS, but achieves flash liquidity using Maker/Sky's own contracts.",
      },
      {
        eipId: "Freeze",
        status: "partial",
        contractPattern: "Planned via governance upgrade — not yet active",
        keyFunctions: [],
        implementationNotes:
          "USDS is deployed behind an ERC1967Proxy, making it upgradeable via Sky governance spells. The governance has voted to enable an optional address-freeze capability for regulatory compliance at institutional scale, but this has NOT been activated yet. The current USDS implementation has no blacklist, no freeze, and no transfer restrictions. When implemented, it would bring USDS closer to USDC-style compliance capability.",
        devImpact:
          "Currently, USDS behaves like DAI — fully permissionless with no freeze. Plan for the possibility that a future governance upgrade adds freeze capability. Monitor Sky governance forums and spell proposals for timeline.",
        footguns:
          "The proxy upgradeability means the compliance surface can change without token migration. Protocols that depend on USDS being freeze-free should monitor governance proposals.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "No seizure mechanism — current or planned",
        keyFunctions: [],
        implementationNotes:
          "No mechanism to destroy or reclaim USDS from any address. The planned freeze capability (when activated) would freeze-in-place only, similar to USDC's model. No destroyBlackFunds-style seizure has been proposed in Sky governance.",
        devImpact:
          "Even after freeze is activated, USDS is expected to follow the USDC freeze-in-place model, not the USDT destroy model. Supply tracking will be unaffected.",
      },
      {
        eipId: "Pause",
        status: "not-implemented",
        contractPattern: "No global pause — could be added via upgrade",
        keyFunctions: [],
        implementationNotes:
          "USDS has no global pause function in the current implementation. Like freeze, a pause could theoretically be added via governance upgrade given the proxy pattern. No governance proposal for global pause has been published.",
        devImpact:
          "Currently, USDS transfers cannot be globally halted. The proxy pattern means this could change — monitor governance.",
      },
    ],
  },

  {
    symbol: "USDe",
    contractName: "USDe.sol + StakedUSDe.sol (Ethena Labs)",
    decimals: 18,
    isUpgradeable: false,
    upgradePattern:
      "None — USDe token is a plain non-upgradeable contract (sUSDe and EthenaMinting are separately upgradeable)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "USDe — minter-gated ERC-20 (Ethena)",
        keyFunctions: [
          "transfer(address to, uint256 amount) → bool",
          "transferFrom(address from, address to, uint256 amount) → bool",
          "approve(address spender, uint256 amount) → bool",
          "allowance(address owner, address spender) → uint256",
          "balanceOf(address account) → uint256",
          "totalSupply() → uint256",
          "mint(address to, uint256 amount) — restricted minters (see USDe.sol)",
          "burn(uint256 amount) — restricted burners / redemption path",
        ],
        implementationNotes:
          "Synthetic dollar: supply changes through Ethena-controlled minters tied to EthenaMinting.sol collateral flows, not retail mint(). Secondary trading is standard ERC-20. Blacklist / compliance hooks are lighter than fiat-backed Paxos/Circle tokens but mint authority is highly centralized.",
        devImpact:
          "Treat USDe like any ERC-20 for DEX and lending integrations; custody and mint paths are protocol-specific.",
        footguns:
          "Do not assume permissionless mint/redeem — primary mint uses EIP-712-signed orders in EthenaMinting.sol. Always use the canonical USDe proxy address from Ethena docs.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "USDe: EIP-712 domain for ERC-20 permit; EthenaMinting.sol: order struct signing",
        keyFunctions: [
          "DOMAIN_SEPARATOR() → bytes32 (on USDe for permit flows)",
          "Mint path: typed data orders signed off-chain — verify Order struct in audited EthenaMinting.sol",
        ],
        implementationNotes:
          "Two distinct EIP-712 surfaces: (1) USDe token uses a standard ERC-20 permit domain for approvals; (2) EthenaMinting V2 (0xe3490297a08d6fC8Da46Edb7B6142E4F461b62D3, deployed July 2024) uses EIP-712 structured orders with fields: order_id, benefactor, collateral_amount, usde_amount, slippage. Signatures are immutable — Ethena cannot alter user-signed orders. Supports both EIP-712 and EIP-1271 signature types, enabling smart contract wallets to participate in minting.",
        devImpact:
          "Builders of mint widgets must implement the minting order schema from Ethena’s contracts — not generic transferWithAuthorization.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "ERC-20 permit extension on USDe (OpenZeppelin-style)",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
        ],
        implementationNotes:
          "Documented in Ethena’s technical materials as standard permit on USDe — same mental model as USDC/USDS for gasless approvals.",
        devImpact:
          "Enables single-transaction DeFi flows when paired with permit-aware routers and paymasters.",
        footguns:
          "Read nonces from the USDe proxy you integrate; confirm domain name/version against on-chain DOMAIN_SEPARATOR() after upgrades.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present on USDe token",
        keyFunctions: [],
        implementationNotes:
          "No transferWithAuthorization-style surface on the canonical USDe ERC-20 — atomic signed transfers are not exposed like Circle FiatToken.",
        devImpact:
          "Payment relayers that depend on EIP-3009 must use permit + transferFrom composition or a wrapper.",
      },
      {
        eipId: "EIP-1967",
        status: "not-implemented",
        contractPattern: "Not a proxy — plain ERC20 contract",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan: USDe at 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3 is a plain, non-upgradeable ERC20 contract deployed via constructor (not initializer). Inherits Ownable2Step, ERC20Burnable, ERC20Permit — no proxy inheritance. The address IS the implementation. sUSDe and EthenaMinting are separate upgradeable contracts, but the base USDe token is immutable.",
        devImpact:
          "USDe token logic cannot be changed — similar trust property to DAI. The mint authority (setMinter) can be reassigned by the owner, but ERC-20 transfer logic is fixed.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "Not a proxy — plain ERC20 contract",
        keyFunctions: [],
        implementationNotes:
          "USDe is not a proxy contract of any type. No UUPS, no transparent proxy, no upgrade mechanism on the token itself. sUSDe and EthenaMinting have their own proxy patterns but the base USDe token is immutable.",
        devImpact:
          "No upgrade considerations for the USDe token. Immutability eliminates upgrade risk on the token layer.",
      },
      {
        eipId: "ERC-4626",
        status: "implemented",
        contractPattern: "StakedUSDe.sol — sUSDe vault",
        keyFunctions: [
          "deposit(uint256 assets, address receiver) → uint256 shares",
          "redeem(uint256 shares, address receiver, address owner) → uint256 assets",
          "previewDeposit / previewRedeem — check cooldown semantics",
          "cooldownDuration() / cooldowns(address) — vesting before full exit",
        ],
        implementationNotes:
          "sUSDe is the yield-bearing share token over USDe with ERC-4626-style deposit/redeem. Cooldown: dynamic 1-7 days (governance-configurable, max 90 days). Auto-extension trigger: if daily unstake requests exceed 2x the 14-day rolling average AND 3-day coverage drops below 1.5x. Anti-attack measures: 8-hour linear reward vesting prevents sandwich attacks; minimum 1 ETH total sUSDe supply threshold prevents donation attacks; rewards can only be positive or zero (no principal slashing). Two-tier sanctions compliance: SOFT_RESTRICTED_STAKER_ROLE (e.g. US addresses) cannot deposit/withdraw but can trade sUSDe on secondary markets; FULL_RESTRICTED_STAKER_ROLE cannot receive sUSDe at all and admin can call redistributeLockedAmount() to move their tokens. Five-role access control on EthenaMinting: DEFAULT_ADMIN_ROLE (multisig), GATEKEEPER (3+ internal + 3+ external security firms — can disable but NOT re-enable), MINTER (~20 EOAs), REDEEMER (~20 EOAs), plus DelegatedSigner for smart contract participants.",
        devImpact:
          "ERC-4626-aware aggregators can price and route sUSDe like other vault shares; account for cooldown when quoting user exits.",
        footguns:
          "Cooldown means instant full liquidity assumptions fail — read previewRedeem and staking rules before building withdrawal UX.",
      },
      {
        eipId: "EIP-1271",
        status: "partial",
        contractPattern:
          "Supported in EthenaMinting V2 via signature_type parameter, not on USDe token itself",
        keyFunctions: [],
        implementationNotes:
          "EthenaMinting V2 accepts EIP-1271 signatures for mint/redeem orders via a signature_type parameter, enabling smart contract wallets to participate. However, the USDe ERC-20 token itself does not implement isValidSignature() — so smart-wallet permit flows on the token layer still require workarounds.",
        devImpact:
          "Smart contract wallets (Safe, AA wallets) can mint/redeem USDe directly via EthenaMinting. For token-level permit flows, EOA co-signers or Permit2 are still needed.",
      },
      {
        eipId: "ERC-7802",
        status: "alternative",
        contractPattern: "USDe uses LayerZero OFT, not ERC-7802",
        keyFunctions: [],
        implementationNotes:
          "Cross-chain USDe movement uses LayerZero Omnichain Fungible Token standard. Unlike USDT0, USDe has not adopted the ERC-7802 crosschain interface on top of OFT.",
        devImpact:
          "Use LayerZero OFT SDK for cross-chain USDe transfers, not ERC-7802 interfaces.",
        alternativeStandard: "LayerZero OFT",
        alternativeNotes:
          "LayerZero Omnichain Fungible Token — burn-and-mint via LayerZero endpoints. Provides cross-chain fungibility without the ERC-7802 standardised interface.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on USDe",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan capability. Permissioned mint path via EthenaMinting prevents flash minting by design.",
        devImpact:
          "Flash loans of USDe available through external DeFi protocols that hold USDe liquidity.",
      },
      {
        eipId: "Freeze",
        status: "partial",
        contractPattern: "sUSDe role-based restrictions — not on base USDe token",
        keyFunctions: [
          "SOFT_RESTRICTED_STAKER_ROLE — cannot deposit/withdraw sUSDe",
          "FULL_RESTRICTED_STAKER_ROLE — cannot receive sUSDe at all",
        ],
        implementationNotes:
          "Ethena implements a two-tier compliance system on sUSDe (the staked vault), not on the base USDe ERC-20. SOFT_RESTRICTED_STAKER_ROLE (e.g. US addresses) can hold and trade sUSDe on secondary markets but cannot deposit or withdraw from the vault. FULL_RESTRICTED_STAKER_ROLE cannot receive sUSDe transfers at all. The base USDe token has no blacklist or freeze function — it transfers freely like any standard ERC-20.",
        devImpact:
          "USDe itself is permissionless to transfer. Compliance restrictions apply only at the sUSDe staking layer. DEX and lending integrations with USDe face no freeze risk, but sUSDe integrations must account for restricted roles.",
        footguns:
          "Do not assume sUSDe restrictions apply to USDe — they are different contracts with different compliance surfaces. A FULL_RESTRICTED address can still hold and transfer USDe freely.",
      },
      {
        eipId: "Seize",
        status: "partial",
        contractPattern: "sUSDe redistributeLockedAmount — not on base USDe",
        keyFunctions: [
          "redistributeLockedAmount(address from, address to) — admin only, sUSDe",
        ],
        implementationNotes:
          "Ethena's admin can call redistributeLockedAmount() on sUSDe to move tokens from a FULL_RESTRICTED address to another address. This is a forced transfer, not destruction — tokens are redirected, not burned. This is unique among major stablecoins: USDT destroys seized funds, USDC freezes in place, but Ethena can actively move them. Only applies to sUSDe, not the base USDe token.",
        devImpact:
          "sUSDe balances of restricted addresses can change without the holder's consent via redistributeLockedAmount(). Monitor admin events on sUSDe. Base USDe balances are sovereign.",
        footguns:
          "redistributeLockedAmount() is a forced transfer, not a burn — totalSupply() does not change, but individual balances do. This can affect protocols that cache sUSDe balances without event monitoring.",
      },
      {
        eipId: "Pause",
        status: "not-implemented",
        contractPattern: "No global pause on USDe or sUSDe",
        keyFunctions: [],
        implementationNotes:
          "Neither the USDe token nor sUSDe has a global pause function. The EthenaMinting contract has a GATEKEEPER role that can disable minting/redeeming, but this does not affect secondary market transfers of USDe or sUSDe. The GATEKEEPER can disable operations but cannot re-enable them — only DEFAULT_ADMIN can re-enable, providing a kill-switch safety property.",
        devImpact:
          "USDe and sUSDe transfers are always operational. Minting/redeeming can be halted by the GATEKEEPER, which affects primary market operations but not DEX trading or lending.",
      },
    ],
  },

  {
    symbol: "FDUSD",
    contractName: "First Digital USD (EVM deployment)",
    decimals: 18,
    isUpgradeable: true,
    upgradePattern:
      "TransparentUpgradeableProxy (EIP-1967) — confirmed via fd-121/fd-stablecoin repository",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "Fiat-backed ERC-20 / BEP-20 with admin mint, burn, blacklist",
        keyFunctions: [
          "transfer(address,uint256) → bool",
          "transferFrom(address,address,uint256) → bool",
          "approve(address,uint256) → bool",
          "balanceOf / allowance / totalSupply",
          "mint / burn — restricted roles",
          "freeze / blacklist-style compliance — verify ABI wording on deployment",
        ],
        implementationNotes:
          "Primary liquidity on Binance-linked venues. Ethereum and BNB Chain share the same 0x-prefixed address pattern on different chain IDs — always confirm chain-native deployment before bridging assumptions.",
        devImpact:
          "Standard wallet and CEX integration; DeFi depth is thinner than USDT/USDC.",
        footguns:
          "Static site data noted a BNB Chain–focused EIP-3009 upgrade — do not assume Ethereum parity until the ABI matches.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "Present when EIP-3009 is enabled (typed authorizations)",
        keyFunctions: ["DOMAIN_SEPARATOR() → bytes32 — call on target chain deployment"],
        implementationNotes:
          "Confirmed via public fd-121/fd-stablecoin repository. FDUSD conforms to EIP-20, EIP-712, and EIP-2612. DOMAIN_SEPARATOR computed per deployment chain — always query from the target chain's contract.",
        devImpact:
          "Required to build relayer-signed payment flows wherever EIP-3009 is live.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "Standard EIP-2612 permit (fd-121/fd-stablecoin)",
        keyFunctions: [],
        implementationNotes:
          "Confirmed in fd-121/fd-stablecoin source code. Standard EIP-2612 permit() with uint256 value parameter. Deployed via Foundry with verification scripts for multiple blockchain explorers.",
        devImpact:
          "Gasless approvals and single-transaction DeFi flows where permit is supported on the target deployment.",
      },
      {
        eipId: "EIP-3009",
        status: "partial",
        contractPattern: "Documented for BNB Chain upgrade path — chain-specific",
        keyFunctions: [
          "transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "receiveWithAuthorization(...) — if mirrored from Circle-style FiatToken",
        ],
        implementationNotes:
          "Site research references a late-2025 BSC-oriented upgrade adding gasless transferWithAuthorization. Ethereum and L2 deployments must be checked independently — function selectors may revert if not upgraded.",
        devImpact:
          "Enables sponsored transfers on chains where the upgrade is live; critical for payment SDK parity with USDC on those chains.",
        footguns:
          "Never assume cross-chain feature parity for custodial stablecoins — fork or read proxy implementation before mainnet spend.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "Possible proxy — confirm storage slots",
        keyFunctions: [],
        implementationNotes:
          "Transparent Proxy pattern confirmed in fd-121/fd-stablecoin repository. Standard EIP-1967 storage slots with separate ProxyAdmin contract. Deployed on Ethereum and BNB Chain independently — contracts are functionally similar but can diverge through separate upgrades.",
        devImpact:
          "Proxy detection drives correct ABI attachment in indexers and wallets.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "TransparentUpgradeableProxy — not UUPS",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan: FDUSD uses OpenZeppelin TransparentUpgradeableProxy (v4.7.0) with a separate ProxyAdmin at 0xbB812B978E41929E86Ad9eA8C1025710FeE85957. The implementation (StablecoinV2) inherits ERC20PermitUpgradeable, Ownable2StepUpgradeable, PausableUpgradeable — no UUPSUpgradeable in the chain. Upgrade functions (upgradeTo/upgradeToAndCall) live on the proxy, not the implementation.",
        devImpact:
          "Standard transparent proxy — upgrade authority is in the ProxyAdmin contract, not the token implementation. No risk of accidentally bricking upgrades via implementation deployment mistakes (a UUPS risk).",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "Not applicable to FDUSD token",
        keyFunctions: [],
        implementationNotes: "No native yield vault in the base FDUSD ERC-20.",
        devImpact: "Yield requires external protocols.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not documented",
        keyFunctions: [],
        implementationNotes: "No public EIP-1271 hook on FDUSD.",
        devImpact: "Smart contract wallets use standard permit only if EIP-2612 exists.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern: "No cross-chain token standard",
        keyFunctions: [],
        implementationNotes:
          "FDUSD deploys independently per chain, not via a cross-chain burn-and-mint standard.",
        devImpact: "Always verify the correct chain-native deployment address.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint",
        keyFunctions: [],
        implementationNotes: "No native flash loan capability on FDUSD.",
        devImpact: "Use external flash loan providers.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "FDUSD — freeze/unfreeze individual accounts",
        keyFunctions: [
          "freeze(address account) — admin role",
          "unfreeze(address account) — admin role",
        ],
        implementationNotes:
          "Confirmed via fd-121/fd-stablecoin repository. FDUSD includes freeze/unfreeze functions for individual account compliance. Frozen accounts cannot send or receive FDUSD. Ethereum and BNB Chain deployments are independent — an address frozen on one chain is not automatically frozen on the other.",
        devImpact:
          "Standard freeze-check pattern applies. Cross-chain freeze status is NOT synchronized — always check on the target chain.",
        footguns:
          "Independent per-chain deployments mean compliance actions must be replicated manually across Ethereum and BNB Chain.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "Freeze only — no seizure/wipe function",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan: FDUSD has no wipeFrozenAddress, destroyBlackFunds, or equivalent. The burn(uint256) function only burns from the caller's own balance (_burn(_msgSender(), amount)) and is onlyOwner — the owner cannot burn tokens from another address. Frozen funds are locked in place but cannot be destroyed or reclaimed. Same model as USDC.",
        devImpact:
          "Frozen FDUSD remains in totalSupply() and balanceOf(). No surprise supply reductions from seizure events. Supply tracking is straightforward.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "PausableUpgradeable — onlyOwner",
        keyFunctions: [
          "pause() — onlyOwner",
          "unpause() — onlyOwner",
        ],
        implementationNotes:
          "Verified on Etherscan: inherits OpenZeppelin PausableUpgradeable. Both _transfer and _approve are guarded by whenNotPaused modifier. When paused, all transfers and approvals are blocked globally. Single-owner model — same key controls freeze, pause, mint, and burn.",
        devImpact:
          "Standard pause risk model — all FDUSD-dependent operations halt during a pause. The single-owner key concentration means no role separation between compliance and operational functions.",
      },
    ],
  },

  {
    symbol: "PYUSD",
    contractName: "PayPal USD — Paxos FiatToken derivative (Ethereum)",
    decimals: 6,
    isUpgradeable: true,
    upgradePattern:
      "Proxy + AccessControl default-admin delay (Paxos) — EIP-1967-style implementation slot typical",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern:
          "Paxos PYUSD: ERC-20 + increaseApproval/decreaseApproval + role-gated supply + freeze/wipe",
        keyFunctions: [
          "transfer / transferFrom / approve → bool",
          "increaseApproval(address,uint256) → bool",
          "decreaseApproval(address,uint256) → bool",
          "balanceOf / allowance / totalSupply / decimals",
          "mint / burn / freeze / unfreeze / wipeFrozenAddress — role-gated",
          "transferFromBatch / transferWithAuthorizationBatch — batch helpers",
        ],
        implementationNotes:
          "Ethereum mainnet contract 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8 (verify). Open-source ABI (paxosglobal/pyusd-contract) shows Paxos’ modern FiatToken feature set: asset protection, pausing, and delegated supply control contract.",
        devImpact:
          "Broadly USDC-class integration surface with extra batch and legacy approval helpers.",
        footguns:
          "Frozen addresses cannot move funds — check isFrozen before building payout pipelines. Supply changes route through SupplyControl — not classic unlimited mint from token owner.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "DOMAIN_SEPARATOR + published typehashes (permit & authorizations)",
        keyFunctions: [
          "DOMAIN_SEPARATOR() → bytes32",
          "PERMIT_TYPEHASH / TRANSFER_WITH_AUTHORIZATION_TYPEHASH / RECEIVE_WITH_AUTHORIZATION_TYPEHASH / CANCEL_AUTHORIZATION_TYPEHASH → bytes32",
        ],
        implementationNotes:
          "On-chain getters expose canonical typehashes, matching Circle-style FiatToken engineering.",
        devImpact:
          "Wallets and relayers can reconstruct signing payloads without hardcoding mismatched hashes.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "permit with ECDSA and compact signature overloads",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)",
          "nonces(address owner) → uint256",
          "cancelPermits(uint256 count) — admin-style nonce invalidation (Paxos extension)",
        ],
        implementationNotes:
          "Supports both v,r,s and generic bytes signatures — useful for smart-wallet signature formats when paired with verification logic.",
        devImpact:
          "Same integration playbook as USDC permit for most DeFi routers.",
        footguns:
          "cancelPermits can invalidate expected nonce sequences — rare but relevant for institutional deployments.",
      },
      {
        eipId: "EIP-3009",
        status: "implemented",
        contractPattern: "EIP3009-style authorizations + batch variants",
        keyFunctions: [
          "transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "receiveWithAuthorization(...)",
          "transferWithAuthorizationBatch / receiveWithAuthorizationBatch (arrays)",
          "cancelAuthorization(address authorizer, bytes32 nonce, …)",
          "authorizationState(address authorizer, bytes32 nonce) → bool",
        ],
        implementationNotes:
          "Matches USDC-class payment rail semantics: random 32-byte nonces, time bounds, cancel path. Batch methods reduce relayer gas for multiparty checkout flows.",
        devImpact:
          "Enables single-call sponsored payments comparable to USDC EIP-3009 integrations.",
        footguns:
          "Prefer receiveWithAuthorization from contracts to mitigate front-running, same as USDC guidance.",
      },
      {
        eipId: "EIP-1967",
        status: "partial",
        contractPattern: "ZeppelinOS AdminUpgradeabilityProxy — pre-EIP-1967 storage slots",
        keyFunctions: [
          "upgradeTo(address newImplementation) — admin only (on proxy)",
          "upgradeToAndCall(address newImplementation, bytes data) — admin only (on proxy)",
          "changeAdmin(address newAdmin) — admin only (on proxy)",
        ],
        implementationNotes:
          "Verified on Etherscan: PYUSD uses a ZeppelinOS-era AdminUpgradeabilityProxy (Solidity 0.4.24), NOT a modern OpenZeppelin TransparentUpgradeableProxy. The storage slots are pre-EIP-1967: implementation at keccak256('org.zeppelinos.proxy.implementation'), admin at keccak256('org.zeppelinos.proxy.admin'). These differ from the EIP-1967 standard slots (keccak256('eip1967.proxy.implementation') - 1). No separate ProxyAdmin contract — the admin address is stored directly in the proxy and calls upgrade functions via the ifAdmin modifier.",
        devImpact:
          "Tools that ONLY check EIP-1967 standard slots may fail to detect PYUSD as a proxy. Etherscan still recognises it, but custom monitoring tools should check both ZeppelinOS and EIP-1967 slot conventions. The lack of a ProxyAdmin means the admin EOA/multisig interacts with the proxy directly.",
        footguns:
          "The non-standard storage slots mean standard EIP-1967 slot-reading utilities (e.g. OpenZeppelin's getImplementationAddress) will return zero. Use ZeppelinOS slot conventions or read from the proxy's admin() and implementation() view functions directly.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "ZeppelinOS Transparent Proxy — not UUPS",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan: PYUSD's implementation (PaxosTokenV2) does not inherit UUPSUpgradeable and has no upgradeTo() function. The upgrade mechanism is entirely in the proxy contract via the ifAdmin modifier pattern. A separate SupplyControl contract in the Paxos codebase does use UUPS, but the PYUSD token itself does not.",
        devImpact:
          "Standard transparent proxy considerations apply. No risk of UUPS-specific upgrade bricking on the token contract.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "PYUSD token is not a vault",
        keyFunctions: [],
        implementationNotes:
          "PayPal custodial yield is off-chain; Solana Token-2022 deployment is out of scope for this EVM EIP table.",
        devImpact: "On-chain ERC-4626 integrations apply to other protocols, not base PYUSD.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not exposed in published PYUSD ABI",
        keyFunctions: [],
        implementationNotes:
          "No isValidSignature on the token — contract wallets rely on signature bytes paths in permit if supported by Paxos verification code.",
        devImpact:
          "May lag USDS-style institutional smart-wallet ergonomics unless middleware wraps PYUSD.",
      },
      {
        eipId: "ERC-7802",
        status: "alternative",
        contractPattern: "PYUSD uses LayerZero OFT for cross-chain, not ERC-7802",
        keyFunctions: [],
        implementationNotes:
          "Cross-chain PYUSD uses LayerZero OFT burn-and-mint mechanics. Not ERC-7802 standardised interface.",
        devImpact: "Use LayerZero SDK for cross-chain PYUSD, not ERC-7802.",
        alternativeStandard: "LayerZero OFT",
        alternativeNotes:
          "LayerZero Omnichain Fungible Token — burn-and-mint via LayerZero endpoints. Achieves cross-chain transfer without the ERC-7802 interface.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on PYUSD",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan capability. Paxos custody model is incompatible with permissionless flash minting.",
        devImpact:
          "Use external flash loan providers for single-transaction PYUSD borrowing.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "Paxos PYUSD — assetProtectionRole freeze/unfreeze",
        keyFunctions: [
          "freeze(address _addr) — assetProtectionRole only",
          "unfreeze(address _addr) — assetProtectionRole only",
          "isFrozen(address _addr) → bool",
        ],
        implementationNotes:
          "Paxos implements freeze via a dedicated assetProtectionRole (separate from owner, supplyController, and betaDelegateWhitelister). This role can freeze individual addresses, preventing them from transferring or receiving PYUSD. On Solana, Paxos holds a PermanentDelegate authority initialized at mint creation — enabling freeze and seizure at the SPL token level without additional contract calls.",
        devImpact:
          "Always check isFrozen() before building payout pipelines. The dedicated assetProtectionRole provides role separation — Paxos compliance team operates independently from supply management.",
        footguns:
          "Solana PermanentDelegate is a fundamentally different mechanism from EVM freeze — it gives Paxos direct authority over any token account, including the ability to transfer tokens without holder consent.",
      },
      {
        eipId: "Seize",
        status: "implemented",
        contractPattern: "Paxos PYUSD — wipeFrozenAddress destroys frozen balances",
        keyFunctions: [
          "wipeFrozenAddress(address _addr) — assetProtectionRole only",
        ],
        implementationNotes:
          "wipeFrozenAddress() destroys the entire balance of a frozen address, similar to USDT's destroyBlackFunds(). The address must be frozen first — calling wipe on a non-frozen address reverts. Emits FrozenAddressWiped event. On Solana, the PermanentDelegate can transfer tokens from any account without consent, enabling seizure by moving (not just destroying) funds.",
        devImpact:
          "Supply tracking must account for wipeFrozenAddress events. totalSupply() decreases when frozen funds are wiped. Paxos operates under NYDFS regulation, so seizure follows established legal processes.",
        footguns:
          "Like USDT's destroyBlackFunds, this may emit non-standard events. Verify event signatures against the Paxos PYUSD ABI.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "Paxos PYUSD — Pausable with dedicated pauser role",
        keyFunctions: [
          "pause() — pauser role only",
          "unpause() — pauser role only",
          "paused() → bool",
        ],
        implementationNotes:
          "Standard OpenZeppelin-style Pausable. When paused, all transfer(), transferFrom(), approve(), mint(), and burn() operations revert. Paxos' pauser role is separate from other admin roles. Paxos has never activated a global pause on PYUSD mainnet.",
        devImpact:
          "Same risk considerations as USDC pause. All PYUSD-dependent DeFi operations would halt during a pause.",
      },
    ],
  },

  {
    symbol: "frxUSD",
    contractName: "frxUSD (Frax Finance) + sfrxUSD vault",
    decimals: 18,
    isUpgradeable: true,
    upgradePattern: "Upgradeable proxy — verify pattern on official Frax docs post-December 2025 migration",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "Standard issuer-controlled ERC-20 with mint/burn admin",
        keyFunctions: [
          "transfer / transferFrom / approve → bool",
          "balanceOf / allowance / totalSupply",
          "mint(address to, uint256 amount) — minter role",
          "burn(address from, uint256 amount) — minter role",
        ],
        implementationNotes:
          "frxUSD is fully collateralized by BlackRock BUIDL; supply is managed by Frax minters tied to BUIDL redemptions. Standard ERC-20 transfer semantics with no algorithmic supply mechanics.",
        devImpact:
          "Treat as a standard fiat-backed ERC-20 — no fractional-reserve or AMO complexity. Verify new contract addresses post-December 2025 migration before integrating.",
        footguns:
          "Do not use old FRAX stablecoin contract addresses — frxUSD is a new contract. The FRAX ticker now refers to the governance token, not the stablecoin.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "OpenZeppelin EIP712 v5.3.0 via ERC20Permit",
        keyFunctions: [
          "DOMAIN_SEPARATOR() → bytes32",
          "domainSeparatorV4() → bytes32 (public, added in FrxUSD3)",
          "eip712Domain() → (bytes1, string, string, uint256, address, bytes32, uint256[]) — EIP-5267",
          "hashTypedDataV4(bytes32 structHash) → bytes32 (public, added in FrxUSD3)",
        ],
        typeHash:
          'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract) — name = "Frax USD", version = "1"',
        implementationNotes:
          "Verified on Etherscan: FrxUSD2 inherits OpenZeppelin ERC20Permit (v5.3.0) which includes EIP712. Domain initialized in constructor with name and version '1'. FrxUSD3 adds public domainSeparatorV4() and hashTypedDataV4() for easier off-chain integration. EIP-5267 eip712Domain() is supported for on-chain domain discovery.",
        devImpact:
          "Full EIP-712 compliance with EIP-5267 discovery. The public hashTypedDataV4() is convenient for off-chain tools constructing signed messages.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "OpenZeppelin ERC20Permit v5.3.0 + custom PermitModule with ERC-1271",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
        ],
        typeHash:
          'keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)") — standard EIP-2612',
        implementationNotes:
          "Verified on Etherscan: FrxUSD3 overrides permit() to delegate to a custom PermitModule (based on OZ 4.9.4 ERC20Permit with namespaced storage). The PermitModule adds ERC-1271 signature validation support — smart contract wallets (Safe, AA wallets) can sign permits natively. Standard sequential per-owner nonces via OpenZeppelin Nonces.",
        devImpact:
          "Drop-in compatible with standard EIP-2612 tooling. The ERC-1271 support in the PermitModule means smart contract wallets work without workarounds — a feature only USDC v2.2 and USDS share among the top stablecoins.",
      },
      {
        eipId: "EIP-3009",
        status: "implemented",
        contractPattern: "FrxUSD3 — EIP3009Module",
        keyFunctions: [
          "transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
          "authorizationState(address authorizer, bytes32 nonce) → bool",
        ],
        implementationNotes:
          "Verified on Etherscan: FrxUSD3 inherits EIP3009Module which adds the full Circle-style transferWithAuthorization suite. Random bytes32 nonces, time bounds (validAfter/validBefore), and cancelAuthorization. This makes frxUSD one of only three stablecoins (alongside USDC and PYUSD) with native EIP-3009 support.",
        devImpact:
          "frxUSD supports atomic signed transfers — payment relayers and checkout flows get the same EIP-3009 integration as USDC. Prefer receiveWithAuthorization from contracts to mitigate front-running.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "Upgradeable proxy — pattern to be confirmed on deployed contract",
        keyFunctions: [
          "upgradeTo / admin — governance-gated",
        ],
        implementationNotes:
          "Frax Finance uses upgradeable proxy patterns. Track governance votes for implementation changes.",
        devImpact:
          "Confirm proxy type and admin from on-chain storage before building long-lived integrations.",
        footguns:
          "New contracts were deployed for frxUSD migration — do not assume old FRAX proxy patterns apply.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "Frax uses transparent proxy pattern, not canonical UUPS",
        keyFunctions: [],
        implementationNotes: "Verify on deployed contract — satellite contracts may differ.",
        devImpact: "Low for typical frxUSD holders.",
      },
      {
        eipId: "ERC-4626",
        status: "implemented",
        contractPattern: "sfrxUSD — ERC-4626 vault over frxUSD backed by BUIDL yield",
        keyFunctions: [
          "deposit(uint256 assets, address receiver) → uint256 shares",
          "mint / withdraw / redeem",
          "convertToShares / convertToAssets / preview*",
          "asset() → address (frxUSD)",
        ],
        implementationNotes:
          "sfrxUSD (StakedFrxUSD) extends LinearRewardsErc4626 with ERC-4626 vault interface. Non-rebasing — share price increases as yield accumulates. Employs Benchmark Yield Strategy (BYS) that dynamically allocates to highest-yielding venue among three governance-approved tiers: (1) carry-trade strategies (Ethena, Superstate), (2) DeFi AMO venues (Aave, Curve, Convex, Euler, Fraxlend, dTrinity), (3) IORB/T-Bill RWA strategies (BlackRock, FinresPBC). Redemption via FraxtalERC4626MintRedeemer with zero fees and zero price impact — contrasts with Ethena's cooldown approach.",
        devImpact:
          "Composable with ERC-4626 routers and aggregators. Yield rate reflects BUIDL fund's T-bill income rather than AMO revenues.",
        footguns:
          "Old sFRAX contracts are not the same as sfrxUSD — verify vault address from official Frax docs post-migration.",
      },
      {
        eipId: "EIP-1271",
        status: "implemented",
        contractPattern: "FrxUSD3 — PermitModule with ERC-1271 signature validation",
        keyFunctions: [
          "isValidSignature(bytes32 hash, bytes signature) → bytes4 (via PermitModule)",
        ],
        implementationNotes:
          "Verified on Etherscan: FrxUSD3 inherits a custom PermitModule (based on OZ 4.9.4 with namespaced storage) that supports ERC-1271 signature validation. Smart contract wallets (Safe multisig, Argent, ERC-4337 accounts) can sign permits directly on the frxUSD token without EOA co-signers. The PermitModule checks isValidSignature on the signer address when the signer is a contract.",
        devImpact:
          "Institutional flows with Safe or AA wallets get native permit support. frxUSD joins USDC v2.2, USDS, and sUSDe (via EthenaMinting) as stablecoins with on-token EIP-1271 support.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern: "No cross-chain token standard confirmed",
        keyFunctions: [],
        implementationNotes:
          "frxUSD is primarily on Ethereum and Fraxtal L2. No ERC-7802 interface.",
        devImpact: "Cross-chain movement through Fraxtal bridge or future integrations.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on frxUSD",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan capability. frxUSD is collateralized by BlackRock BUIDL — permissionless flash minting would conflict with the reserve-backed model.",
        devImpact: "Use external flash loan providers.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "FrxUSD2 — freeze/thaw with batch support, owner bypasses all checks",
        keyFunctions: [
          "freeze(address _owner) — onlyOwner",
          "freezeMany(address[] memory _owners) — onlyOwner, batch",
          "thaw(address _owner) — onlyOwner (unfreeze)",
          "thawMany(address[] memory _owners) — onlyOwner, batch",
          "isFrozen(address) → bool (public mapping)",
        ],
        implementationNotes:
          "Verified on Etherscan (FrxUSD2 at 0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29). Uses 'freeze/thaw' terminology rather than 'blacklist/unblacklist'. The _update override enforces: if isFrozen[to] || isFrozen[from] || isFrozen[msg.sender], revert IsFrozen(). Critically, the owner bypasses ALL freeze and pause checks in _update — the owner can always transfer, even from/to frozen addresses.",
        devImpact:
          "Standard freeze-check pattern. The batch freeze/thaw functions (freezeMany/thawMany) are unique among the stablecoins tracked and enable efficient mass compliance actions. The owner bypass is a significant trust assumption.",
        footguns:
          "The owner bypasses freeze checks entirely — meaning the owner can transfer tokens involving frozen addresses. This is by design for compliance operations but means the owner key has more power than in USDC-style contracts where the blacklister cannot move funds.",
      },
      {
        eipId: "Seize",
        status: "implemented",
        contractPattern: "FrxUSD2 — owner burn from ANY address (frozen or not)",
        keyFunctions: [
          "burn(address _owner, uint256 _amount) — onlyOwner, burns from any address; if _amount == 0 burns entire balance",
          "burnMany(address[] memory _owners, uint256[] memory _amounts) — onlyOwner, batch burn from multiple addresses",
        ],
        implementationNotes:
          "Verified on Etherscan: the MOST powerful seizure mechanism among all tracked stablecoins. burn(address, uint256) can burn tokens from ANY address — frozen or not — without the holder's consent. If _amount is 0, the ENTIRE balance is burned. burnMany enables batch seizure across multiple addresses in a single transaction. Because the owner bypasses freeze/pause checks in _update, these burns always succeed regardless of contract state. This goes beyond USDT's destroyBlackFunds (which requires the address to be blacklisted first) and PYUSD's wipeFrozenAddress (which requires the address to be frozen first).",
        devImpact:
          "frxUSD's owner can unilaterally destroy any holder's balance at any time, without needing to freeze the address first. This is the broadest admin power of any stablecoin in the dataset. Supply tracking must account for burn events from arbitrary addresses.",
        footguns:
          "Unlike USDT (requires blacklist first) or PYUSD (requires freeze first), frxUSD burn has NO precondition — the owner can burn from any address immediately. The batch burnMany function compounds this: a single transaction can wipe balances across many addresses. Any protocol holding frxUSD should understand this trust assumption.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "FrxUSD2 — custom Pausable, owner bypasses",
        keyFunctions: [
          "pause() — onlyOwner",
          "unpause() — onlyOwner",
          "isPaused() → bool (public variable)",
        ],
        implementationNotes:
          "Verified on Etherscan: custom pause implementation (not OpenZeppelin PausableUpgradeable). When isPaused is true, all transfers revert with IsPaused() — except transfers by the owner, who bypasses the pause check in _update. Uses Ownable2Step (two-step ownership transfer) for safety.",
        devImpact:
          "Standard pause risk model with the notable exception that the owner can still transfer during a pause. This means the owner can move their own tokens or execute compliance operations even while the contract is paused for everyone else.",
      },
    ],
  },

  {
    symbol: "TUSD",
    contractName: "TrueUSD — TokenController proxy + delegate",
    decimals: 18,
    isUpgradeable: true,
    upgradePattern: "Controller → implementation delegate (legacy TrustToken/Techteryx pattern — Archblock filed Chapter 11 bankruptcy 2025)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "partial",
        contractPattern: "Proxy ERC-20 with registry + optional TrueReward accounting legacy",
        keyFunctions: [
          "transfer / transferFrom / approve",
          "balanceOf / allowance / totalSupply",
          "mint / burn — controller-only",
          "freezeAccount / wipeFrozenAccount — compliance",
        ],
        implementationNotes:
          "Legacy fiat-token architecture using TrueCurrencyWithLegacyAutosweep inheritance chain. Proxy address 0x0000000000085d4780B73119b644AE5ecd22b376 uses deliberate leading zeros (vanity deployment) — can confuse address parsers that strip leading zeros. Implementation at 0xDBC97a631c2fee80417d5d69f32b198c8c39c27e. Historical TrueReward feature allowed per-account interest toggling via balance struct flag — deprecated but legacy code remains. Extreme operational risk: $456M reserves stuck in illiquid investments, Justin Sun $456M bailout, SEC fraud settlement, Archblock bankruptcy.",
        devImpact:
          "Still usable as ERC-20 on DEXes but with thinner liquidity and more issuer-specific edge cases than USDC.",
        footguns:
          "Always read balances from the proxy users actually hold — implementation swaps have happened. Reserve attestation controversy (2025) is operational, not ABI-level, but affects counterparty trust.",
      },
      {
        eipId: "EIP-712",
        status: "not-implemented",
        contractPattern: "No modern FiatToken EIP-712 domain on legacy TUSD",
        keyFunctions: [],
        implementationNotes:
          "Unlike PYUSD/USDC, canonical Ethereum TUSD does not ship the Circle/Paxos EIP-712 permit stack.",
        devImpact: "No typed-data signing for token operations.",
      },
      {
        eipId: "EIP-2612",
        status: "not-implemented",
        contractPattern: "No permit()",
        keyFunctions: [],
        implementationNotes: "Use approve + transferFrom or Permit2.",
        devImpact: "Extra transaction for many DeFi onboarding flows.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "No transferWithAuthorization",
        keyFunctions: [],
        implementationNotes: "Gasless transfer pattern not available on canonical TUSD.",
        devImpact: "Relayers cannot use EIP-3009.",
      },
      {
        eipId: "EIP-1967",
        status: "partial",
        contractPattern: "Custom controller proxy — not guaranteed EIP-1967 slot layout",
        keyFunctions: [
          "delegateToUpgradeContract / upgrade path via controller — verify on explorer",
        ],
        implementationNotes:
          "Behaves like an upgradeable token but may not match strict EIP-1967 storage layout — automated proxy detection tools can mislabel TUSD.",
        devImpact:
          "Manual verification of implementation address on each chain is required for critical integrations.",
        footguns:
          "Assuming standard EIP-1967 tooling works without validation can attach the wrong ABI after upgrades.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "Not UUPS",
        keyFunctions: [],
        implementationNotes: "Upgrade path is controller-mediated, not EIP-1822.",
        devImpact: "Low direct impact.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "No native TUSD vault token",
        keyFunctions: [],
        implementationNotes: "Yield, if offered historically, was via separate mechanisms — not ERC-4626 on base TUSD.",
        devImpact: "Use external protocols for yield.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes: "No isValidSignature on TUSD.",
        devImpact: "Standard EOA-centric flows only for approvals.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern: "No cross-chain token standard",
        keyFunctions: [],
        implementationNotes:
          "TUSD has no standardised cross-chain interface. L2 deployments are independent.",
        devImpact: "Manual bridging required.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint",
        keyFunctions: [],
        implementationNotes: "No native flash loan capability on TUSD.",
        devImpact: "Use external flash loan providers.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "TrueUSD — TokenController freeze",
        keyFunctions: [
          "freezeAccount(address _account) — controller only",
          "unfreezeAccount(address _account) — controller only",
        ],
        implementationNotes:
          "TUSD includes freezeAccount/unfreezeAccount via the TokenController proxy pattern. Frozen accounts cannot transfer or receive TUSD. Given TUSD's operational turmoil (Archblock bankruptcy, SEC fraud settlement, $456M frozen reserves), the compliance mechanism is functional but the entity exercising it is under legal stress.",
        devImpact:
          "Standard freeze check applies, but counterparty risk around who controls the freeze function is elevated. The controller key's current custodian (Techteryx) should be verified.",
        footguns:
          "TUSD's operational instability means the freeze function could be exercised unpredictably. Protocols integrating TUSD should account for heightened operational risk beyond normal compliance actions.",
      },
      {
        eipId: "Seize",
        status: "implemented",
        contractPattern: "TrueUSD — wipeFrozenAccount",
        keyFunctions: [
          "wipeFrozenAccount(address _account) — controller only",
        ],
        implementationNotes:
          "wipeFrozenAccount() destroys the balance of a frozen account, reducing totalSupply(). Same pattern as USDT's destroyBlackFunds and PYUSD's wipeFrozenAddress. Address must be frozen first.",
        devImpact:
          "Supply tracking must account for wipe events. Same operational risk caveats as the freeze function.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "TrueUSD — Pausable",
        keyFunctions: [
          "pause() — controller only",
          "unpause() — controller only",
        ],
        implementationNotes:
          "Standard Pausable pattern. When paused, all transfers revert. Controller-gated. Given TUSD's operational challenges, the pause mechanism carries elevated counterparty risk.",
        devImpact:
          "Same DeFi-wide halt risk as other pausable stablecoins, compounded by TUSD's operational instability.",
      },
    ],
  },

  {
    symbol: "USD1",
    contractName: "USD1 (WLFI) — Foundry/Solidity",
    decimals: 18,
    isUpgradeable: true,
    upgradePattern:
      "TransparentUpgradeableProxy (EIP-1967) — confirmed via worldliberty/usd1-smart-contracts",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "Standard fiat-backed ERC-20/BEP-20",
        keyFunctions: [
          "Standard ERC-20 interface",
          "mint(address, uint256) — issuer only",
          "burn(uint256) — issuer only",
          "freeze(address) — compliance",
          "unfreeze(address) — compliance",
        ],
        implementationNotes:
          "Follows standard fiat-backed stablecoin pattern (similar to Paxos FiatToken). BitGo acts as custodian. Mint and burn controlled by WLFI with reserves held by BitGo. IMPORTANT: Always verify contract address from official WLFI sources — do not use addresses from unofficial channels.",
        devImpact:
          "Standard ERC-20 integration. No signature extensions confirmed at this time.",
        footguns:
          "Early-stage issuer with limited public documentation. Contract addresses must be verified on Etherscan/BscScan from official WLFI sources. Audit reports not yet independently available — full due diligence recommended before any production integration.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "EIP-712 domain for permit (worldliberty/usd1-smart-contracts)",
        keyFunctions: [],
        implementationNotes:
          "Confirmed via worldliberty/usd1-smart-contracts repository — conforms to EIP-712 for typed data signing. Used by EIP-2612 permit.",
        devImpact:
          "Typed-data signing for permit and similar flows matches standard ERC-20Permit patterns.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "Standard EIP-2612 permit (worldliberty/usd1-smart-contracts)",
        keyFunctions: [],
        implementationNotes:
          "Confirmed via worldliberty/usd1-smart-contracts — standard EIP-2612 permit() for gasless approvals.",
        devImpact:
          "Enables gasless approvals and USDC-class DeFi router integration on supported deployments.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present",
        keyFunctions: [],
        implementationNotes:
          "No evidence of EIP-3009 implementation at this stage.",
        devImpact:
          "Single-transaction payment flows not possible without this. Would need to be added as an upgrade.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "TransparentUpgradeableProxy (worldliberty/usd1-smart-contracts)",
        keyFunctions: [
          "implementation() / admin() via proxy tooling (if standard slots are used)",
        ],
        implementationNotes:
          "TransparentUpgradeableProxy confirmed in worldliberty/usd1-smart-contracts. Contract address 0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d on both Ethereum and BNB Chain. Deployed across 11 networks: Ethereum, BNB, Plume, Monad, Mantle, Morph, XLayer, Solana, TRON, Aptos.",
        devImpact:
          "Standard proxy tooling and implementation tracking apply on EVM deployments.",
        footguns:
          "Do not assume storage slot layout from marketing copy. Confirm on-chain before relying on automated proxy detection.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "No public UUPS evidence",
        keyFunctions: [],
        implementationNotes:
          "No verified implementation indicates UUPS-specific interfaces or upgrade authorization hooks.",
        devImpact:
          "Treat USD1 as non-UUPS unless a verified implementation proves otherwise.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "Not a vault token",
        keyFunctions: [],
        implementationNotes:
          "USD1 is currently presented as a fiat-backed payment stablecoin, not a yield vault share token.",
        devImpact:
          "Protocols need external wrappers or vault products for ERC-4626 compatibility.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "No isValidSignature — verified from Etherscan source",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan (implementation 0x3398385c…): USD1's Stablecoin contract inherits ERC20PermitUpgradeable, Ownable2StepUpgradeable, PausableUpgradeable — no EIP-1271 implementation anywhere in the inheritance chain. No isValidSignature function exists. The 17 source files contain zero references to ERC1271, IERC1271, or isValidSignature.",
        devImpact:
          "Smart contract wallets (Safe, AA wallets) cannot natively sign USD1 permits. EOA co-signers or Permit2 are required for institutional custody workflows that depend on contract-signed permits.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern:
          "No cross-chain token standard — independent deployments per chain",
        keyFunctions: [],
        implementationNotes:
          "USD1 deploys independently across 11 chains. No standardised cross-chain burn-and-mint interface. Same contract address used on EVM chains.",
        devImpact: "Verify deployment on each target chain independently.",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash mint on USD1",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan capability. Fiat-backed reserve model is incompatible with permissionless flash minting.",
        devImpact: "Use external flash loan providers.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "USD1 — freeze/unfreeze (worldliberty/usd1-smart-contracts)",
        keyFunctions: [
          "freeze(address _account) — compliance role",
          "unfreeze(address _account) — compliance role",
        ],
        implementationNotes:
          "Confirmed via worldliberty/usd1-smart-contracts repository. USD1 includes freeze/unfreeze for individual account compliance. Frozen accounts cannot send or receive USD1. Deployed on both Ethereum and BNB Chain — freeze status per chain deployment (independent contracts at same address).",
        devImpact:
          "Standard freeze-check pattern. USD1 is a newer entrant — verify the operational procedures and key management around freeze authority.",
        footguns:
          "No formal smart contract security audit from a recognized firm has been publicly disclosed for USD1 — the freeze mechanism's implementation quality is unaudited. Verify on-chain before relying on it.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "Freeze only — no seizure/wipe function",
        keyFunctions: [],
        implementationNotes:
          "Verified on Etherscan (implementation 0x3398385c…): USD1 has no wipeFrozenAddress, destroyBlackFunds, or equivalent. The burn(uint256) function only burns from the caller's own balance (_burn(_msgSender(), amount)) and is onlyOwner. The owner cannot burn tokens from another address. Frozen funds are locked in place. Same freeze-only model as USDC and FDUSD. renounceOwnership() is explicitly disabled (reverts with 'Unsupported'), so the contract will always have an owner.",
        devImpact:
          "Frozen USD1 remains in totalSupply() and balanceOf(). No surprise supply changes from seizure. The permanently non-renounceable ownership is a notable design choice — the admin key can never be burned.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "PausableUpgradeable — onlyOwner",
        keyFunctions: [
          "pause() — onlyOwner",
          "unpause() — onlyOwner",
        ],
        implementationNotes:
          "Verified on Etherscan: inherits OpenZeppelin PausableUpgradeable. Both _transfer and _approve have whenNotPaused modifier. When paused, all transfers and approvals are blocked globally. Single-owner model with renounceOwnership() disabled — the contract will always have an active owner with pause authority.",
        devImpact:
          "Standard pause risk model. The non-renounceable ownership combined with TransparentUpgradeableProxy means WLFI retains full admin control permanently.",
      },
    ],
  },

  {
    symbol: "GHO",
    contractName: "GhoToken (Solmate-derived ERC20 + OZ AccessControl)",
    decimals: 18,
    deployedBlock: 17698470,
    isUpgradeable: false,
    upgradePattern:
      "Non-proxied on Ethereum mainnet (constructor-deployed, immutable). L2 deployments (Arbitrum, Base, Avalanche, Gnosis, Mantle) use UpgradeableGhoToken behind TransparentUpgradeableProxy.",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern:
          "Custom Solmate-derived ERC20 — gas-optimised, inherits IERC20",
        keyFunctions: [
          "transfer(address to, uint256 amount) → bool",
          "transferFrom(address from, address to, uint256 amount) → bool",
          "approve(address spender, uint256 amount) → bool",
          "allowance(address owner, address spender) → uint256",
          "balanceOf(address account) → uint256",
          "totalSupply() → uint256",
          "mint(address account, uint256 amount) — facilitator only",
          "burn(uint256 amount) — facilitator only",
        ],
        implementationNotes:
          "Standard ERC-20 with bool returns on transfer/transferFrom/approve. Based on Solmate ERC20 (gas-optimised, unchecked math for balance increments). Differs from standard tokens: mint() and burn() are not admin-gated by a single owner but by the facilitator model — any registered facilitator with available bucket capacity can mint. approve() has no zero-first requirement (unlike USDC). Infinite approval (type(uint256).max) short-circuits the allowance deduction in transferFrom. No fee-on-transfer. AccessControl roles: DEFAULT_ADMIN_ROLE (Aave Governance executor), FACILITATOR_MANAGER_ROLE, BUCKET_MANAGER_ROLE.",
        devImpact:
          "Standard ERC-20 integration — no SafeERC20 needed (returns bool). The facilitator-gated mint/burn is transparent to token holders; transfers are fully permissionless with no freeze or pause checks.",
        footguns:
          "Unlike USDC/USDT, GHO has no freeze or pause — transfers always succeed if balance is sufficient. This means GHO cannot be frozen for sanctions compliance at the token level. Facilitator bucket capacity limits total supply — check getFacilitatorBucket() before assuming unlimited mintability.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern:
          "Built into custom ERC20 base — DOMAIN_SEPARATOR computed from name, version, chainId, verifyingContract",
        keyFunctions: [
          "DOMAIN_SEPARATOR() → bytes32",
          "PERMIT_TYPEHASH → bytes32 (constant)",
        ],
        typeHash:
          'keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")',
        implementationNotes:
          'Domain separator uses name = "Gho Token", version = "1", block.chainid, address(this). On Ethereum mainnet, INITIAL_DOMAIN_SEPARATOR is cached at construction time (INITIAL_CHAIN_ID = block.chainid) and DOMAIN_SEPARATOR() returns the cached value if chainid matches — gas optimisation for the common case. On chain fork, recomputes dynamically. L2 UpgradeableERC20 always computes dynamically (no INITIAL_CHAIN_ID caching) since proxy deployment makes constructor caching unsafe.',
        devImpact:
          "Prerequisite for EIP-2612 permit. Signatures are bound to chain ID and contract address — correctly handles chain forks. Use the contract address (not any proxy) as verifyingContract on Ethereum mainnet.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern:
          "Built into custom ERC20 base — standard sequential-nonce permit",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
          "PERMIT_TYPEHASH → bytes32",
          "DOMAIN_SEPARATOR() → bytes32",
        ],
        typeHash:
          'keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)") = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9',
        implementationNotes:
          "Standard EIP-2612 implementation. Sequential per-owner nonce in nonces mapping, incremented in unchecked block. ecrecover-based signature verification. Reverts on expired deadline or invalid signer. permit() returns void (not bool) — matches Solmate pattern and is compatible with standard EIP-2612 since the spec does not mandate a return value. Aave V3 provides supplyWithPermit() and repayWithPermit() that batch permit + pool action atomically.",
        devImpact:
          "Enables gasless approval flows. Aave V3 natively supports permit-based interactions (supplyWithPermit, repayWithPermit). Third-party protocols can use permit() for single-tx approve+action patterns.",
        footguns:
          "permit() returns void, not bool — callers checking for a bool return will get unexpected behaviour. Front-running risk: an attacker can front-run your permit+transferFrom by submitting just the permit. Use Permit2 or ensure atomic execution.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "Not present in GhoToken or ERC20 base",
        keyFunctions: [],
        implementationNotes:
          "GHO does not implement transferWithAuthorization, receiveWithAuthorization, or cancelAuthorization. The custom Solmate-derived ERC20 base only includes EIP-2612 permit. This is a deliberate design choice — GHO prioritises DeFi composability (permit + pool actions) over payment-flow authorizations.",
        devImpact:
          "No single-transaction gasless transfer capability. Payment flows requiring atomic transfers must use permit() + transferFrom() in two steps (or batched via multicall). For payment use cases, consider wrapping in a helper contract.",
      },
      {
        eipId: "EIP-1967",
        status: "not-implemented",
        contractPattern:
          "Ethereum mainnet GHO is not proxied — constructor-deployed immutable contract",
        keyFunctions: [],
        implementationNotes:
          "The Ethereum mainnet GhoToken (0x40D16FC0…) is a plain contract deployed via constructor — no proxy, no EIP-1967 storage slots, no admin slot. Etherscan shows 'Source Code' (not 'Source Code (Proxy)'). The contract logic is immutable. L2 deployments (Arbitrum, Base, Avalanche, Gnosis, Mantle) use UpgradeableGhoToken behind TransparentUpgradeableProxy with standard EIP-1967 slots — those ARE proxied and upgradeable by governance.",
        devImpact:
          "On Ethereum mainnet, interact directly with 0x40D16FC0… — there is no proxy indirection. On L2s, use the proxy address and be aware of upgradeability. The split architecture (immutable L1, upgradeable L2) is unique among stablecoins.",
        footguns:
          "Do not assume GHO is upgradeable on Ethereum — it is not. L2 GHO tokens can be upgraded by governance. Monitor governance proposals for L2 implementation changes.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern:
          "Not UUPS — Ethereum mainnet is non-proxied; L2s use TransparentUpgradeableProxy",
        keyFunctions: [],
        implementationNotes:
          "GHO does not use UUPS on any chain. Ethereum mainnet is non-proxied entirely. L2 deployments use TransparentUpgradeableProxy (not UUPS). The upgrade logic lives in the proxy admin, not the UpgradeableGhoToken implementation contract.",
        devImpact:
          "No UUPS-specific concerns. On L2s, standard TransparentUpgradeableProxy patterns apply.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern:
          "GHO is not a vault token. stkGHO uses custom StakeToken (not ERC-4626).",
        keyFunctions: [],
        implementationNotes:
          "Neither GHO nor stkGHO implements ERC-4626. stkGHO (0x1a88Df1c…) uses bgd-labs/StakeToken — a custom staking contract with stake/redeem/previewStake/previewRedeem, exchange rate mechanics, cooldown period, and slashing — but does NOT conform to ERC-4626 (no deposit/withdraw/convertToShares/convertToAssets/maxDeposit/maxWithdraw). The GSM4626 variant accepts ERC-4626 vault shares as exogenous tokens (e.g., yield-bearing USDC vaults), but GHO itself is not a vault. Yield on GHO comes from stkGHO staking rewards (AAVE tokens) and stkAAVE discount rate, not from vault mechanics.",
        devImpact:
          "Do not expect ERC-4626 interfaces on GHO or stkGHO. For vault-compatible GHO yield, external protocols must wrap GHO. The stkGHO exchange rate mechanism (previewStake/previewRedeem) is custom — do not assume ERC-4626 naming or semantics.",
        footguns:
          "stkGHO has a cooldown period before unstaking — funds are not instantly redeemable. The exchange rate can change due to slashing events. Not compatible with ERC-4626 aggregators.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "No isValidSignature in GhoToken",
        keyFunctions: [],
        implementationNotes:
          "GHO does not implement EIP-1271 isValidSignature(). The permit() function uses ecrecover only — smart contract wallets (Safe, Argent, ERC-4337 accounts) cannot natively sign GHO permits. This is inherited from the Solmate ERC20 base which only supports EOA signatures.",
        devImpact:
          "Smart contract wallets need Permit2 or EOA co-signer workarounds for gasless approval flows with GHO. This is a notable gap compared to USDC v2.2 which added EIP-1271 support.",
        footguns:
          "Safe multisig and AA wallets will fail when calling permit() directly — ecrecover returns address(0) for contract signatures, causing INVALID_SIGNER revert.",
      },
      {
        eipId: "ERC-7802",
        status: "alternative",
        contractPattern:
          "GHO uses Chainlink CCIP (lock-and-mint / burn-and-mint), not ERC-7802",
        keyFunctions: [],
        implementationNotes:
          "GHO's cross-chain architecture uses Chainlink CCIP — not the ERC-7802 crosschainMint/crosschainBurn interface. On Ethereum: GhoCCIPTokenPoolEthereum (0x06179f7C…) locks/releases GHO. On L2s: GhoCCIPTokenPool burns/mints via UpgradeableGhoToken facilitator model. CCIP rate limits and pool capacities are governance-controlled. Available on Ethereum, Arbitrum, Base, Avalanche, Gnosis, Mantle (8 networks per CCIP directory including Ink and Plasma).",
        devImpact:
          "Cross-chain GHO transfers require CCIP Router interactions — not a simple crosschainMint/crosschainBurn call. Use Chainlink CCIP SDK and contracts. Bridge fees are CCIP message fees (paid in LINK or native token).",
        alternativeStandard: "Chainlink CCIP",
        alternativeNotes:
          "Lock-and-mint from Ethereum, burn-and-mint between L2s. GhoCCIPTokenPool contracts are facilitators with governance-controlled bucket capacities. Rate-limited by CCIP lane configuration.",
      },
      {
        eipId: "ERC-3156",
        status: "implemented",
        contractPattern:
          "GhoFlashMinter facilitator — separate contract implementing IERC3156FlashLender",
        keyFunctions: [
          "maxFlashLoan(address token) → uint256",
          "flashFee(address token, uint256 amount) → uint256",
          "flashLoan(IERC3156FlashBorrower receiver, address token, uint256 amount, bytes data) → bool",
          "getFee() → uint256 (bps)",
          "CALLBACK_SUCCESS → bytes32",
        ],
        implementationNotes:
          "GhoFlashMinter (0xb639D208Bcf0589D54FaC24E655C79EC529762B8) is a facilitator with its own bucket capacity. It mints GHO to the receiver, expects CALLBACK_SUCCESS from onFlashLoan(), then transferFrom's amount + fee back and burns the principal. Fee is expressed in basis points (MAX_FEE = 10000 = 100%). Aave-approved flash borrowers (ACLManager.isFlashBorrower) pay 0 fee. Since FlashMinter is a facilitator, maxFlashLoan is limited by remaining bucket capacity, not existing liquidity. Fees accumulate in the contract and are distributed to the GHO treasury via distributeFeesToTreasury().",
        devImpact:
          "Standard ERC-3156 integration — implement IERC3156FlashBorrower.onFlashLoan() and return CALLBACK_SUCCESS. GHO flash minting creates new supply temporarily (unlike pool-based flash loans that use existing liquidity). Ideal for GHO peg arbitrage, liquidations, and debt refinancing.",
        footguns:
          "Flash mint is limited by the FlashMinter's bucket capacity, not by existing GHO supply. The fee can be updated by pool admin — check getFee() at execution time, not at integration time. The transferFrom in repayment requires the receiver contract to have approved the FlashMinter for amount + fee.",
      },
      {
        eipId: "Freeze",
        status: "not-implemented",
        contractPattern:
          "No freeze/blacklist capability on GhoToken",
        keyFunctions: [],
        implementationNotes:
          "GHO has no freeze, blacklist, or address-blocking mechanism. The GhoToken contract has no isBlacklisted(), freeze(), or equivalent function. transfer() and transferFrom() execute unconditionally (subject only to balance checks). This is a deliberate design choice for a decentralised, governance-controlled stablecoin — there is no centralised compliance officer. AccessControl roles (FACILITATOR_MANAGER_ROLE, BUCKET_MANAGER_ROLE, DEFAULT_ADMIN_ROLE) control supply/facilitator management, not individual transfers.",
        devImpact:
          "GHO transfers are fully permissionless — no transfer will revert due to address restrictions. Integrators do not need to handle freeze/blacklist edge cases. However, this means GHO cannot comply with OFAC sanctions at the token level — enforcement happens at the protocol/frontend layer (Aave app geo-blocking, CEX KYC).",
        footguns:
          "Regulatory risk: jurisdictions requiring token-level freeze capability may not approve GHO for certain regulated use cases. The lack of freeze is a feature for DeFi composability but a limitation for institutional/regulated adoption.",
      },
      {
        eipId: "Seize",
        status: "not-implemented",
        contractPattern: "No seizure — no freeze means no seize",
        keyFunctions: [],
        implementationNotes:
          "No freeze capability means no seize capability. burn() can only be called by facilitators on their own balance — no administrative ability to destroy or reclaim tokens from arbitrary addresses.",
        devImpact:
          "GHO supply is deterministic from facilitator mint/burn events. No surprise supply changes from seizure. totalSupply() accurately reflects all circulating GHO.",
      },
      {
        eipId: "Pause",
        status: "not-implemented",
        contractPattern:
          "No global pause on GhoToken — transfers are always active",
        keyFunctions: [],
        implementationNotes:
          "GHO has no pause() or unpause() function. The GhoToken contract does not inherit Pausable or include any whenNotPaused modifiers. Transfers are always active. Note: individual GSM instances CAN be frozen/unfrozen (OracleSwapFreezer), but this only affects GSM buy/sell operations — it does not pause GHO token transfers. The Aave V3 pool can be paused independently, which would prevent new GHO minting/repaying via borrow/repay, but would not freeze existing GHO transfers.",
        devImpact:
          "GHO is always transferable — DeFi protocols can rely on GHO transfers never being globally paused. This is advantageous for collateral and liquidation flows. However, Aave V3 pool pause would block new GHO creation.",
        footguns:
          "GSM freeze (OracleSwapFreezer) is sometimes confused with GHO token pause — they are different. GSM freeze blocks buy/sell swaps in the stability module only. GHO token transfers remain unaffected.",
      },
    ],
  },

  {
    symbol: "RLUSD",
    contractName: "StablecoinUpgradeableV2",
    decimals: 18,
    deployedBlock: 20492031,
    isUpgradeable: true,
    upgradePattern: "UUPS (EIP-1822) with ERC-1967 storage slots — upgrade logic in implementation via UPGRADER_ROLE",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "ERC20Upgradeable (OZ v5.3.0) → StablecoinUpgradeable → StablecoinUpgradeableV2",
        keyFunctions: [
          "transfer(address to, uint256 value) → bool",
          "transferFrom(address from, address to, uint256 value) → bool",
          "approve(address spender, uint256 value) → bool — overridden with pause checks",
          "allowance(address owner, address spender) → uint256",
          "balanceOf(address account) → uint256",
          "totalSupply() → uint256",
          "mint(address to, uint256 value) — MINTER_ROLE only",
          "burn(uint256 value) — BURNER_ROLE only",
        ],
        implementationNotes:
          "Fully compliant ERC-20 on OZ v5.3.0 ERC20Upgradeable. 18 decimals (unlike USDC/USDT/PYUSD which use 6). transfer() and transferFrom() return bool correctly. approve() overridden to enforce account-level and global pause checks. The _update() hook checks pause status on from, to, and msg.sender for every transfer. Separate MINTER_ROLE and BURNER_ROLE for minting and burning.",
        devImpact:
          "Standard ERC-20 interface works with all EVM wallets, DEXes, and DeFi protocols. The 18-decimal precision is critically different from most USD stablecoins (USDC/USDT/PYUSD all use 6 decimals) — integrators must account for this.",
        footguns:
          "18 decimals is the critical gotcha — most USD stablecoins use 6. Hardcoding 1e6 for 'one dollar' will produce drastically wrong results. Always read decimals() dynamically. approve() also blocked when contract or accounts are paused.",
      },
      {
        eipId: "EIP-712",
        status: "implemented",
        contractPattern: "EIP712Upgradeable (OZ v5) via ERC20PermitUpgradeable — added in V2 upgrade",
        keyFunctions: ["DOMAIN_SEPARATOR() → bytes32"],
        typeHash:
          'keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)") — name = "RLUSD", version = "1"',
        implementationNotes:
          'Domain separator initialized via __ERC20Permit_init("RLUSD") in V2. Uses name = "RLUSD", version = "1", chainId = 1, verifyingContract = proxy address. Added in V2 upgrade (September 2025) — V1 had no EIP-712 support. DOMAIN_SEPARATOR recalculated dynamically via _domainSeparatorV4() to handle chain forks.',
        devImpact:
          "Prerequisite for EIP-2612 permit. Signatures are bound to the proxy address and chain ID. Use the proxy address (0x8292Bb45...) as verifyingContract for off-chain verification.",
      },
      {
        eipId: "EIP-2612",
        status: "implemented",
        contractPattern: "ERC20PermitUpgradeable (OZ v5.1.0) — added in V2 upgrade",
        keyFunctions: [
          "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          "nonces(address owner) → uint256",
          "DOMAIN_SEPARATOR() → bytes32",
        ],
        typeHash:
          'keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")',
        implementationNotes:
          "Standard OZ ERC20PermitUpgradeable with sequential nonces. V2 overrides permit() to add compliance modifiers: whenAccountNotPaused(owner), whenAccountNotPaused(spender), whenAccountNotPaused(_msgSender()), whenNotPaused. permit() reverts if ANY of the three addresses are frozen or if globally paused. Uses ECDSA.recover() — EOA signatures only, no EIP-1271.",
        devImpact:
          "Enables gasless approval for DeFi flows. Compliance checks on permit() mean frozen accounts cannot have approvals changed even via gasless signatures. Smart contract wallets cannot sign permits (no EIP-1271).",
        footguns:
          "permit() checks msg.sender pause status — a frozen relayer causes revert even if owner and spender are clean. nonces must be read from the proxy address. Pre-V2 signatures are meaningless. No EIP-1271 means Safe/AA wallets cannot use permit().",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "No transferWithAuthorization in contract source",
        keyFunctions: [],
        implementationNotes:
          "RLUSD does not implement EIP-3009. No transferWithAuthorization(), receiveWithAuthorization(), or cancelAuthorization(). The only gasless flow is EIP-2612 permit(). Notable omission compared to USDC which implements both.",
        devImpact:
          "No single-call gasless transfers. Must use permit() + transferFrom() as two separate calls. No random-nonce concurrent authorization support — permits use sequential nonces only.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "StablecoinProxy extends ERC1967Proxy (OZ v5.0.0)",
        keyFunctions: [
          "getImplementation() → address — public view on StablecoinProxy",
          "IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        ],
        implementationNotes:
          "StablecoinProxy extends OZ ERC1967Proxy and adds a public getImplementation() view. Uses standard EIP-1967 implementation and admin storage slots. Despite Etherscan labeling it 'Transparent Proxy', the upgrade mechanism is UUPS — the proxy has no admin/transparent separation. Upgraded V1 → V2 on September 6, 2025 (block 23300630).",
        devImpact:
          "Standard EIP-1967 slots mean block explorers and monitoring tools auto-detect the proxy. Always interact with the proxy address, never the implementation.",
        footguns:
          "Etherscan labels it 'Transparent Proxy' but it is UUPS. The implementation address has changed (V1 is inactive). Monitor Upgraded events.",
      },
      {
        eipId: "EIP-1822",
        status: "implemented",
        contractPattern: "UUPSUpgradeable (OZ v5.3.0) — upgrade logic in StablecoinUpgradeable",
        keyFunctions: [
          "proxiableUUID() → bytes32",
          "upgradeToAndCall(address newImplementation, bytes data)",
          "_authorizeUpgrade(address) — onlyRole(UPGRADER_ROLE)",
        ],
        implementationNotes:
          "UUPS is the actual upgrade pattern. StablecoinUpgradeable extends UUPSUpgradeable. _authorizeUpgrade() gated by UPGRADER_ROLE via AccessControl. proxiableUUID() validates implementation compatibility during upgrade. UPGRADE_INTERFACE_VERSION = '5.0.0'. Already exercised once (V1→V2) to add permit support.",
        devImpact:
          "UUPS is cheaper to deploy than Transparent Proxy (no separate ProxyAdmin). Upgrade authority is a dedicated UPGRADER_ROLE key. Ripple has already used this path once to add features without token migration.",
        footguns:
          "If an upgrade deploys an implementation without UUPSUpgradeable, the proxy is bricked permanently. UPGRADER_ROLE key is a single point of failure for upgradeability.",
      },
      {
        eipId: "ERC-4626",
        status: "not-implemented",
        contractPattern: "Payment stablecoin only — no vault",
        keyFunctions: [],
        implementationNotes:
          "RLUSD is a payment stablecoin with no yield or vault functionality. No ERC-4626 interface. Yield on RLUSD would require external DeFi protocols to create their own vault wrappers.",
        devImpact:
          "No native yield mechanism. External ERC-4626 vaults must be created by DeFi protocols for yield-bearing RLUSD products.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "No isValidSignature — permit uses ECDSA.recover (EOA only)",
        keyFunctions: [],
        implementationNotes:
          "ERC20PermitUpgradeable uses ECDSA.recover() for permit signature verification. No isValidSignature(bytes32, bytes) callback for smart contract wallets. Safe multisigs, Argent, and ERC-4337 smart accounts cannot use permit() natively.",
        devImpact:
          "Smart contract wallets cannot sign RLUSD permit messages — limits gasless flows to EOAs. Institutional custody using multisigs must use on-chain approve() or Permit2.",
      },
      {
        eipId: "ERC-7802",
        status: "not-implemented",
        contractPattern: "Separate native issuances per chain — no cross-chain interface",
        keyFunctions: [],
        implementationNotes:
          "RLUSD is natively issued on Ethereum (ERC-20) and XRP Ledger (IOU) as completely separate contracts with independent supply management. No crosschainMint() or crosschainBurn(). No bridge, CCIP, OFT, or cross-chain mechanism on the Ethereum contract. Moving between chains requires Ripple-mediated mint/burn.",
        devImpact:
          "No permissionless cross-chain transfer capability. Third-party bridges cannot mint canonical RLUSD. Limits composability vs USDC (CCTP) or USDT (OFT).",
      },
      {
        eipId: "ERC-3156",
        status: "not-implemented",
        contractPattern: "No flash loan capability",
        keyFunctions: [],
        implementationNotes:
          "No native flash loan or flash mint functionality. Flash loans of RLUSD would only become available if external DeFi protocols list it once sufficient liquidity exists.",
        devImpact:
          "Cannot use RLUSD for single-transaction borrow-use-repay patterns natively. Must rely on external providers.",
      },
      {
        eipId: "Freeze",
        status: "implemented",
        contractPattern: "AccountPausableUpgradeable — custom Ripple contract with ERC-7201 namespaced storage",
        keyFunctions: [
          "pauseAccounts(address[] calldata accounts) — PAUSER_ROLE, must be ascending sorted",
          "unpauseAccount(address account) — PAUSER_ROLE",
          "accountPaused(address account) → bool",
        ],
        implementationNotes:
          "Custom AccountPausableUpgradeable uses ERC-7201 namespaced storage. Internal mapping _frozen[address] → bool. Frozen accounts cannot send, receive, approve, or have permit() called on their behalf — _update() and approve()/permit() overrides enforce whenAccountNotPaused on from, to, and msg.sender. pauseAccounts() requires ascending sorted input (gas optimization, prevents duplicates). V2 uses _tryPauseAccount() which is idempotent.",
        devImpact:
          "Account freezing blocks ALL value movement including incoming transfers. Check accountPaused() before building payment pipelines. Uses 'pause/accountPaused()' terminology (not 'blacklist/isBlacklisted' like USDC).",
        footguns:
          "pauseAccounts() requires ascending sorted addresses — unsorted arrays revert. Frozen accounts still hold balance in balanceOf() but can only have tokens removed via clawback(). A frozen msg.sender (relayer/router) blocks all submitted transactions.",
      },
      {
        eipId: "Seize",
        status: "implemented",
        contractPattern: "clawback(address, uint256) via CLAWBACKER_ROLE — burns from any address including frozen",
        keyFunctions: [
          "clawback(address from, uint256 value) — CLAWBACKER_ROLE, burns tokens from target",
        ],
        implementationNotes:
          "Full seizure via clawback(). CLAWBACKER_ROLE can burn from ANY address, including frozen accounts. V2's _update() override allows this bypass. More powerful than USDC (freeze-only), comparable to USDT's destroyBlackFunds(). Seized tokens are permanently destroyed, reducing totalSupply().",
        devImpact:
          "totalSupply() can decrease from clawback events. Protocols tracking RLUSD supply should monitor Transfer(from, address(0)) where from != msg.sender. Clawback represents counterparty risk — frozen collateral in lending protocols can be destroyed, causing bad debt.",
        footguns:
          "Unlike USDC where frozen funds remain in balanceOf() indefinitely, RLUSD frozen funds can be destroyed at any time. Fundamentally changes risk model for DeFi protocols holding large positions.",
      },
      {
        eipId: "Pause",
        status: "implemented",
        contractPattern: "ERC20PausableUpgradeable (OZ v5.1.0) — global circuit-breaker",
        keyFunctions: [
          "pause() — PAUSER_ROLE",
          "unpause() — PAUSER_ROLE",
          "paused() → bool",
        ],
        implementationNotes:
          "Global pause via OZ ERC20PausableUpgradeable. whenNotPaused modifier on _update() blocks ALL transfer(), transferFrom(), mint(), burn() contract-wide. approve() and permit() also explicitly blocked during global pause. PAUSER_ROLE controls both global pause and per-account freezes — single key for both capabilities.",
        devImpact:
          "Global pause freezes ALL RLUSD operations: transfers, DeFi swaps, lending, liquidations. approve() and permit() also revert — protocols cannot even prepare approvals during pause.",
        footguns:
          "During pause, approve() and permit() also revert — not just transfers. Lending protocols cannot execute liquidations, DEXes cannot process swaps. Same PAUSER key for global and per-account — single key compromise could freeze everything.",
      },
    ],
  },
]
