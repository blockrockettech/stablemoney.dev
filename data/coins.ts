import type { Coin } from "@/types"

export const coins: Coin[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    issuer: "Tether Limited",
    rank: 1,
    marketCap: "~$184B",
    type: "fiat",
    description:
      "Largest stablecoin by market cap and dominant liquidity layer across crypto exchanges. Launched 2014 on Bitcoin Omni layer, now spans 15+ blockchains. Over $1T monthly volume.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        isPrimary: true,
        notes: "~103B supply, 13M+ holders",
      },
      {
        name: "TRON",
        chain: "tron",
        standard: "TRC-20",
        contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        isPrimary: true,
        notes: "Highest tx volume, cheapest fees",
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "BEP-20",
        contract: "0x55d398326f99059fF775485246999027B3197955",
        isPrimary: true,
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "SPL",
        contract: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        isPrimary: true,
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        isPrimary: false,
        notes: "USDT0 native L2 via LayerZero OFT",
      },
      {
        name: "Polygon",
        chain: "polygon",
        standard: "ERC-20",
        contract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        isPrimary: false,
      },
      {
        name: "Avalanche",
        chain: "avalanche",
        standard: "ERC-20",
        contract: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        isPrimary: false,
      },
      {
        name: "Optimism",
        chain: "optimism",
        standard: "ERC-20",
        contract: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        isPrimary: false,
      },
      {
        name: "Bitcoin Omni",
        chain: "bitcoin",
        standard: "Omni",
        contract: "Property ID: 31",
        isPrimary: false,
        notes: "Original deployment, minimal usage",
      },
      {
        name: "TON",
        chain: "ton",
        standard: "Jetton",
        contract: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
        isPrimary: false,
      },
    ],
    features: [
      {
        name: "Blacklist/Freeze",
        category: "compliance",
        description:
          "Issuer can freeze addresses globally — critical for sanctions compliance, introduces censorship risk.",
      },
      {
        name: "Cross-chain native via OFT",
        category: "cross-chain",
        description:
          "USDT0 on Arbitrum uses LayerZero OFT standard for native cross-chain movement without bridge wrapping.",
      },
      {
        name: "ERC-20 standard",
        category: "authorization",
        description:
          "Standard ERC-20 interface with added pause and blacklist admin functions on EVM chains.",
      },
      {
        name: "TRC-20 high-volume deployment",
        category: "compliance",
        description:
          "Highest-volume deployment due to near-zero fees — dominant in retail and exchange use.",
      },
      {
        name: "Daily reserve reports",
        category: "compliance",
        description:
          "Tether publishes daily attestations and quarterly third-party reports on reserve composition.",
      },
      {
        name: "Issuer mint/burn",
        category: "compliance",
        description:
          "Tether mints and burns centrally; on-chain supply reflects reserve backing decisions.",
      },
    ],
    reserves:
      "Total reserves ~$192.9B (Q4 2025): US Treasuries ~$141.6B plus cash & equivalents, repo, money market funds, Bitcoin, gold, and other assets (figures shift each quarter)",
    collateralType: "Fiat and equivalents (off-chain)",
    pegMechanism: "Hard 1:1 via centralized issuer redemption",
    auditor: "BDO Italia (quarterly attestation)",
    defiIntegration: "Deep Uniswap, Curve, Aave, Compound liquidity across all chains",
    yield: "None native",
    risks: [
      { label: "Centralization", level: "medium" },
      { label: "Regulatory exposure", level: "medium" },
      { label: "Historical reserve opacity", level: "low" },
    ],
    technicalNotes:
      "6 decimals. Ethereum TetherToken (Solidity 0.4.x) is one of the most non-standard ERC-20s: transfer/transferFrom/approve return void (not bool) — requires SafeERC20. approve() reverts if allowance != 0 (use forceApprove). Dormant fee-on-transfer via basisPointsRate/maximumFee (currently 0/0, activatable by owner). destroyBlackFunds() burns blacklisted balances — more aggressive than USDC's freeze-in-place. USDT0 (Jan 2025) adopts LayerZero OFT + draft ERC-7802 crosschainMint/crosschainBurn across 15+ networks (OpenZeppelin audited, no critical findings, $50B+ moved). Custom deprecate() upgrade mechanism — NOT EIP-1967 standard proxy slots.",
    docsUrl: "https://tether.to",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    issuer: "Circle",
    rank: 2,
    marketCap: "~$77B",
    type: "fiat",
    description:
      "Most developer-friendly and compliance-forward stablecoin. Native on 32 blockchains as of early 2026 with Cross-Chain Transfer Protocol (CCTP) for native burns-and-mints across 21 chains. Circle completed its IPO on NYSE (ticker: CRCL) in January 2026.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        isPrimary: true,
        notes: "FiatToken v2.2",
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "SPL",
        contract: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        isPrimary: true,
      },
      {
        name: "Base",
        chain: "base",
        standard: "ERC-20",
        contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        isPrimary: true,
        notes: "Native, not bridged",
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        isPrimary: true,
        notes: "Native USDC, not USDC.e",
      },
      {
        name: "Polygon",
        chain: "polygon",
        standard: "ERC-20",
        contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        isPrimary: true,
        notes: "Native (0x2791 is bridged)",
      },
      {
        name: "Avalanche",
        chain: "avalanche",
        standard: "ERC-20",
        contract: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        isPrimary: true,
      },
      {
        name: "Optimism",
        chain: "optimism",
        standard: "ERC-20",
        contract: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        isPrimary: true,
      },
      {
        name: "Sui",
        chain: "sui",
        standard: "Move",
        contract: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15cdbe1a00",
        isPrimary: false,
        notes: "RegulatedCoin standard",
      },
      {
        name: "Stellar",
        chain: "stellar",
        standard: "Stellar asset",
        contract: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        isPrimary: false,
      },
      {
        name: "Aptos",
        chain: "aptos",
        standard: "Move",
        contract: "0x1::usdc::USDC",
        isPrimary: false,
      },
      {
        name: "NEAR",
        chain: "near",
        standard: "NEP-141",
        contract: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        isPrimary: false,
      },
      {
        name: "Hedera",
        chain: "hedera",
        standard: "HTS",
        contract: "0.0.456858",
        isPrimary: false,
      },
      {
        name: "ZKsync Era",
        chain: "zksync",
        standard: "ERC-20",
        contract: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4",
        isPrimary: false,
      },
      {
        name: "Starknet",
        chain: "starknet",
        standard: "ERC-20",
        contract: "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        isPrimary: false,
      },
      {
        name: "XRP Ledger",
        chain: "xrp",
        standard: "IOU",
        contract: "Issuer: rcEGREd8NmkKRE8GE424sksyt1tJVFZwu",
        isPrimary: false,
      },
    ],
    features: [
      {
        name: "EIP-2612 permit()",
        category: "authorization",
        eip: "EIP-2612",
        description:
          "Gasless approval via signed message. Users approve without a separate on-chain transaction — critical for DeFi UX.",
      },
      {
        name: "EIP-3009 transferWithAuthorization",
        category: "authorization",
        eip: "EIP-3009",
        description:
          "Single-use signed transfer with random nonce — eliminates persistent allowances for one-time payments.",
      },
      {
        name: "Permit2 compatible",
        category: "authorization",
        description:
          "Compatible with Uniswap Permit2 for unified approval management across ERC-20 tokens.",
      },
      {
        name: "CCTP v2 cross-chain",
        category: "cross-chain",
        description:
          "Cross-Chain Transfer Protocol — burn on source chain, native mint on destination. No bridge liquidity pools, no wrapped token risk. 20+ chains supported.",
      },
      {
        name: "Blacklist and Pause",
        category: "compliance",
        description:
          "FiatToken admin can freeze individual addresses or pause the entire contract globally.",
      },
      {
        name: "TransparentUpgradeableProxy",
        category: "compliance",
        description:
          "Circle can update the implementation contract via the proxy owner — allows feature additions and security patches.",
      },
      {
        name: "SEC-registered reserve fund",
        category: "compliance",
        description:
          "Reserve invested in Circle Reserve Fund (2a-7 MMF), managed by BlackRock, custodied at BNY Mellon. Daily public reporting.",
      },
      {
        name: "Gasless meta-transactions",
        category: "authorization",
        description:
          "Supports relayer-submitted transferWithAuthorization — user signs, relayer pays gas.",
      },
    ],
    reserves: "Cash and Circle Reserve Fund (US Treasuries via BlackRock/BNY Mellon)",
    collateralType: "Fiat and equivalents (off-chain)",
    pegMechanism: "Hard 1:1 — redeem via Circle Mint (institutional) or exchanges",
    auditor: "Deloitte (monthly attestation)",
    defiIntegration:
      "#1 or #2 liquidity on Aave, Compound, Curve, Uniswap, MakerDAO across all chains",
    yield: "None native; earnable via DeFi lending",
    risks: [
      { label: "Centralization", level: "medium" },
      { label: "Banking dependency — SVB depeg March 2023", level: "low" },
    ],
    technicalNotes:
      "6 decimals. FiatToken v2.2 uses bit-packing: single storage slot per address (bit 255 = blacklist, bits 0-254 = balance) — saves ~6-7% gas. Five-role admin: admin (upgrades), owner (roles), masterMinter (mint allowances), pauser (global pause), blacklister (freeze), plus rescuer (rescueERC20 for stuck tokens). EIP-1271 added in v2.2 — smart contract wallets can sign permits. CCTP v2: fast finality (~20s ETH, ~8s L2), hooks for atomic post-transfer actions, TokenMessengerV2 + MessageTransmitterV2. Critical: native USDC vs bridged USDC.e — always confirm native address per chain.",
    docsUrl: "https://www.circle.com/usdc",
  },
  {
    symbol: "USDe",
    name: "Ethena USDe",
    issuer: "Ethena Labs",
    rank: 4,
    marketCap: "~$5.9B",
    type: "synthetic",
    description:
      "Third-largest stablecoin and most technically novel. Achieves dollar peg via delta-neutral hedge — users deposit ETH/BTC collateral while the protocol opens an equal short perpetual futures position. Yield flows from funding rates and ETH staking to sUSDe holders.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
        isPrimary: true,
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "LayerZero OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT",
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "LayerZero OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT, Binance Earn integration",
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "LayerZero OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT",
      },
      {
        name: "ZKsync Era",
        chain: "zksync",
        standard: "LayerZero OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT",
      },
      {
        name: "TON",
        chain: "ton",
        standard: "Jetton/OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT",
      },
      {
        name: "Aptos",
        chain: "aptos",
        standard: "LayerZero OFT",
        contract: "See Ethena docs for OFT address",
        isPrimary: false,
        notes: "Via LayerZero OFT",
      },
    ],
    features: [
      {
        name: "Delta-neutral peg mechanism",
        category: "stability",
        description:
          "1 USDe = $1 ETH spot long + $1 ETH short perpetual. Price neutrality maintained programmatically without fiat reserves.",
      },
      {
        name: "ERC-4626 vault — sUSDe",
        category: "yield",
        eip: "ERC-4626",
        description:
          "Staked USDe follows ERC-4626 vault standard. Share token (sUSDe) appreciates in USDe terms as yield accrues — no manual claiming.",
      },
      {
        name: "Funding rate yield",
        category: "yield",
        description:
          "Short perpetual positions earn positive funding in bull markets (~5-11% APY in 2024-25). Yield passed to sUSDe holders.",
      },
      {
        name: "ETH staking layer yield",
        category: "yield",
        description:
          "Collateral held as stETH/cbETH earns ~4% ETH consensus and execution layer yield on top of funding income.",
      },
      {
        name: "Off-exchange settlement custody",
        category: "compliance",
        description:
          "Collateral delegated (never transferred) to CEXes via Copper/Fireblocks/Ceffu. Exchange never holds custody of keys.",
      },
      {
        name: "LayerZero OFT cross-chain",
        category: "cross-chain",
        description:
          "Cross-chain movement uses LayerZero Omnichain Fungible Token standard — no wrapped tokens or liquidity pools.",
      },
      {
        name: "Permissioned mint/redeem",
        category: "compliance",
        description:
          "Direct mint and redeem requires KYC/KYB whitelisting. Secondary market via Curve and Uniswap AMM pools is permissionless.",
      },
      {
        name: "EIP-712 signed mint orders",
        category: "authorization",
        eip: "EIP-712",
        description:
          "Minting uses EIP-712 typed structured data signatures — relayer submits signed order atomically.",
      },
    ],
    reserves:
      "stETH, ETH, BTC, USDC, USDtb plus offsetting short perpetual positions on Binance, Bybit, OKX, Deribit",
    collateralType: "Crypto + derivatives hedge",
    pegMechanism:
      "Soft — delta-neutral math maintains backing, no guaranteed 1:1 redemption",
    auditor: "Quantstamp, Cyfrin (smart contract audits)",
    defiIntegration:
      "Major Curve pools (USDe/USDC, USDe/DAI), Aave collateral, Pendle yield-stripping",
    yield: "sUSDe ~5–20% APY variable (funding-rate dependent)",
    risks: [
      { label: "Funding rate can go negative", level: "high" },
      { label: "CEX counterparty risk", level: "medium" },
      { label: "Extreme gap-down liquidation", level: "high" },
      {
        label: "Not classified as payment stablecoin under GENIUS Act",
        level: "medium",
      },
    ],
    technicalNotes:
      "18 decimals. EthenaMinting V2 (0xe3490297…, July 2024): EIP-712 signed orders are immutable — Ethena cannot alter user signatures. Supports both EIP-712 and EIP-1271 signature types (smart contract wallets can mint). Five-role access control: DEFAULT_ADMIN (multisig), GATEKEEPER (3+ internal + 3+ external security firms — can disable but NOT re-enable), MINTER (~20 EOAs), REDEEMER (~20 EOAs), DelegatedSigner. sUSDe: dynamic cooldown 1-7 days (max 90), auto-extends if unstake requests exceed 2x 14-day average, 8-hour linear reward vesting (anti-sandwich), two-tier sanctions (SOFT_RESTRICTED cannot deposit/withdraw but can trade; FULL_RESTRICTED + redistributeLockedAmount). Custodians: Copper, Ceffu, Fireblocks, Anchorage, Kraken (Jan 2026).",
    docsUrl: "https://www.ethena.fi",
    githubUrl: "https://github.com/ethena-labs",
  },
  {
    symbol: "DAI",
    name: "Multi-Collateral Dai",
    issuer: "Sky Protocol (formerly MakerDAO)",
    rank: 6,
    marketCap: "~$4.3B",
    type: "crypto",
    description:
      "Original decentralized stablecoin, live since December 2017. Users open Vaults and over-collateralize crypto to mint DAI. MakerDAO rebranded to Sky Protocol in 2024 and launched USDS as a successor — DAI and USDS are freely interchangeable 1:1. Fully on-chain governance by SKY token holders.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        isPrimary: true,
        notes: "DAI — immutable contract",
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        isPrimary: false,
      },
      {
        name: "Optimism",
        chain: "optimism",
        standard: "ERC-20",
        contract: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        isPrimary: false,
      },
      {
        name: "Polygon",
        chain: "polygon",
        standard: "ERC-20",
        contract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        isPrimary: false,
      },
      {
        name: "Base",
        chain: "base",
        standard: "ERC-20",
        contract: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        isPrimary: false,
      },
    ],
    features: [
      {
        name: "Multi-collateral vaults",
        category: "stability",
        description:
          "Accept ETH, WBTC, stETH, USDC, real-world assets, and governance-approved tokens as collateral via Vat.sol.",
      },
      {
        name: "DAI Savings Rate — DSR",
        category: "yield",
        description:
          "Deposit DAI into DSR Pot contract to earn protocol-level yield without DeFi risk — funded by vault stability fees.",
      },
      {
        name: "Liquidation auctions — Dog/Clip",
        category: "stability",
        description:
          "Under-collateralised vaults trigger Dutch auction via Clip.sol — collateral sold to cover debt with liquidation penalty.",
      },
      {
        name: "On-chain governance via SKY",
        category: "governance",
        description:
          "All risk parameters, collateral types, stability fees voted on-chain by SKY token holders via governance spells.",
      },
      {
        name: "Peg Stability Module — PSM",
        category: "stability",
        description:
          "1:1 fee-less swaps between DAI and whitelisted stablecoins (USDC) — key tool for maintaining peg at scale.",
      },
      {
        name: "Real-world asset integration",
        category: "stability",
        description:
          "US Treasuries and private credit held in off-chain SPVs contribute to collateral pool (RWA exposure was ~$2.68B+ mid‑2025; varies over time).",
      },
      {
        name: "Decentralised oracle — Medianizer",
        category: "stability",
        description:
          "Median of whitelist oracle feeds used for collateral price — resistant to single oracle manipulation.",
      },
    ],
    reserves: "ETH (~40%), stETH, WBTC, RWAs (~$2.68B+ mid‑2025), USDC via PSM (varies over time)",
    collateralType: "On-chain crypto and RWAs",
    pegMechanism: "Algorithmic via DSR, PSM arbitrage, and liquidation mechanisms",
    auditor: "Trail of Bits, PwC (periodic), community-audited",
    defiIntegration:
      "Foundational — used as collateral, trading pair, and yield instrument across Aave, Compound, Curve, Uniswap",
    yield: "DSR variable (~4–8% historically)",
    risks: [
      { label: "Collateral volatility", level: "medium" },
      { label: "Governance attack vector", level: "medium" },
      { label: "RWA counterparty risk", level: "medium" },
      { label: "Oracle manipulation", level: "medium" },
    ],
    technicalNotes:
      "18 decimals. DAI is the ONLY major stablecoin with native ERC-3156 flash loans (DssFlash module 0x60744434d6339a6B27d73d9Eda62b6F66a0a04FA). permit() is NON-STANDARD: uses bool allowed (not uint256 value) — setting true = MAX_UINT approval, false = 0. Silently coerces uint256 to bool, breaking standard EIP-2612 ABIs. MCD core: Vat.sol, Jug.sol, Dog.sol, Clip.sol, Pot.sol. Immutable contract — no upgrade path, no freeze capability. DaiUsds.sol enables permissionless 1:1 DAI↔USDS conversion.",
    docsUrl: "https://sky.money",
    githubUrl: "https://github.com/makerdao",
  },
  {
    symbol: "USDS",
    name: "Sky USDS",
    issuer: "Sky Protocol",
    rank: 3,
    marketCap: "~$7.5B",
    type: "crypto",
    description:
      "Upgraded successor to DAI, launched with the MakerDAO→Sky Protocol rebrand in 2024. Interchangeable with DAI at 1:1 via DaiUsds.sol migration contract. Key additions: upgradeable proxy, planned freeze function for regulatory compliance, Sky Savings Rate, and Solana deployment.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0xdC035D45d973E3EC169d2276DDab16f1e407384F",
        isPrimary: true,
        notes: "ERC1967Proxy upgradeable",
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "Wormhole OFT",
        contract: "See Sky docs for Wormhole OFT mint",
        isPrimary: false,
        notes: "Via Wormhole OFT, first non-EVM deployment 2025",
      },
    ],
    features: [
      {
        name: "1:1 DAI migration",
        category: "stability",
        description:
          "USDS↔DAI swappable at 1:1 via DaiUsds.sol — no liquidity pool, no slippage, no fees.",
      },
      {
        name: "Sky Savings Rate — sUSDS",
        category: "yield",
        description:
          "ERC-4626 sUSDS vault earns SSR (~4.75%) continuously. Directly funded by vault stability fees.",
      },
      {
        name: "ERC1967Proxy upgradeable",
        category: "compliance",
        eip: "EIP-1967",
        description:
          "Sky governance can upgrade the USDS implementation via governance spell — enables future features including freeze.",
      },
      {
        name: "Planned freeze function",
        category: "compliance",
        description:
          "Governance voted to enable optional asset-freeze capability for regulatory compliance at institutional scale. Not yet active.",
      },
      {
        name: "Sky Token Rewards",
        category: "governance",
        description:
          "USDS holders accrue SKY governance token rewards — incentivises migration from DAI.",
      },
      {
        name: "Solana cross-chain",
        category: "cross-chain",
        description:
          "First non-EVM deployment via Wormhole — expands USDS to high-throughput Solana ecosystem.",
      },
    ],
    reserves: "Identical to DAI — shared MCD protocol collateral pool",
    collateralType: "On-chain crypto and RWAs (shared with DAI)",
    pegMechanism: "Same as DAI — PSM, SSR, liquidation mechanisms",
    auditor: "Shared with Sky Protocol audits",
    defiIntegration: "Aave, Spark (Sky native lending), Yearn",
    yield: "sUSDS ~4.75% SSR",
    risks: [
      { label: "Upgradeability introduces governance risk", level: "medium" },
      { label: "Potential future freeze capability", level: "low" },
      { label: "Slower adoption than DAI", level: "low" },
    ],
    technicalNotes:
      "18 decimals. sUSDS uses chi rate accumulator — convertToAssets() calculates theoretical current chi on-the-fly even if drip() hasn't been called. No fees assessed and fees CANNOT be enabled (encoded in contract). UUPS (EIP-1822) upgrade pattern on sUSDS — if implementation without upgradeTo() is deployed, contract becomes permanently non-upgradeable (safety property). Cross-chain via Wormhole NTT with burn-and-mint and rate-limiting. DaiUsds.sol: permissionless bidirectional DAI↔USDS 1:1 converter.",
    docsUrl: "https://sky.money",
    githubUrl: "https://github.com/makerdao",
  },
  {
    symbol: "FDUSD",
    name: "First Digital USD",
    issuer: "First Digital Trust Limited",
    rank: 9,
    marketCap: "~$450M",
    type: "fiat",
    description:
      "Launched June 2023 to replace Binance's BUSD after wind-down. Primarily used for trading pairs on Binance, though usage has declined sharply. In April 2025, Justin Sun publicly accused First Digital Trust of insolvency, causing a brief depeg to $0.87 before recovering. Binance subsequently delisted multiple FDUSD trading pairs in early 2026, accelerating market cap decline from a ~$2B+ peak.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        isPrimary: true,
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "BEP-20",
        contract: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
        isPrimary: true,
        notes: "Same address, different chain",
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "0x0000000000000000000000000000000000000000",
        isPrimary: false,
        notes:
          "Address not in static spec — verify native Arbitrum deployment on official First Digital docs before integration.",
      },
      {
        name: "TON",
        chain: "ton",
        standard: "Jetton",
        contract: "See official FDUSD TON deployment",
        isPrimary: false,
        notes: "Native deployment July 2025, Telegram ecosystem",
      },
    ],
    features: [
      {
        name: "EIP-3009 gasless transfers on BSC",
        category: "authorization",
        eip: "EIP-3009",
        description:
          "Deployed December 2025 — third-party can sponsor gas for FDUSD transfers on BNB Chain via transferWithAuthorization.",
      },
      {
        name: "Bankruptcy-remote trust structure",
        category: "compliance",
        description:
          "Reserves held in segregated, bankruptcy-remote accounts at First Digital Trust — structurally ring-fenced from issuer.",
      },
      {
        name: "Chainlink PoR oracle",
        category: "compliance",
        description:
          "Chainlink FDUSD/USD price feed on BNB Chain mainnet provides on-chain price data.",
      },
      {
        name: "Monthly attestations",
        category: "compliance",
        description: "Independent third-party reserve attestations published monthly.",
      },
      {
        name: "Issuer mint/burn/freeze",
        category: "compliance",
        description:
          "Standard ERC-20/BEP-20 admin functions for mint, burn, and blacklist.",
      },
    ],
    reserves: "Cash and cash equivalents held in trust by First Digital Trust Ltd",
    collateralType: "Fiat (off-chain)",
    pegMechanism: "Hard 1:1 via trust company redemption",
    auditor: "Prescient Assurance (monthly attestation)",
    defiIntegration:
      "Primarily CEX trading pairs on Binance — limited on-chain DeFi integration",
    yield: "None",
    risks: [
      { label: "April 2025 Justin Sun insolvency accusation and depeg", level: "high" },
      { label: "Binance pair delistings — declining usage and market cap", level: "high" },
      { label: "Binance concentration", level: "medium" },
    ],
    technicalNotes:
      "18 decimals. TransparentUpgradeableProxy (EIP-1967) confirmed via fd-121/fd-stablecoin repository. Conforms to EIP-20, EIP-712, EIP-2612 (standard permit). Built with Foundry. freeze/unfreeze functions for individual accounts. Ethereum and BNB Chain contracts are independent deployments (same address, different chains) — can diverge through separate upgrades. EIP-3009 BSC upgrade (Dec 2025). Chainlink FDUSD/USD price feed on BNB Chain.",
  },
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    issuer: "Paxos Trust Company (for PayPal)",
    rank: 7,
    marketCap: "~$4.1B",
    type: "fiat",
    description:
      "Most UX-focused stablecoin with deep fintech integration across PayPal and Venmo (400M+ users). Issued by Paxos (NYDFS-regulated). The Solana deployment uses Token Extensions (Token-2022) enabling confidential transfers, transfer hooks, and memo fields. In March 2026, PayPal expanded PYUSD to 70 international markets across Asia-Pacific, Europe, Latin America, and North America.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
        isPrimary: true,
        notes: "Paxos FiatToken v1",
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "Token-2022",
        contract: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        isPrimary: true,
        notes: "SPL Token Extensions program",
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "See Paxos docs for Arbitrum address",
        isPrimary: false,
        notes: "Via LayerZero OFT burn-and-mint",
      },
      {
        name: "Stellar",
        chain: "stellar",
        standard: "Stellar asset",
        contract: "See Paxos docs for Stellar issuer",
        isPrimary: false,
      },
      {
        name: "Other chains",
        chain: "multichain",
        standard: "OFT / native",
        contract: "See Paxos/PayPal docs for current deployments",
        isPrimary: false,
        notes:
          "PYUSD is live on additional chains beyond this static list — always verify canonical addresses.",
      },
    ],
    features: [
      {
        name: "Solana Token-2022 extensions",
        category: "authorization",
        description:
          "Uses Token Extensions (Token-2022) program — bakes compliance and payment features directly into the token standard without separate contracts.",
      },
      {
        name: "Confidential transfers",
        category: "compliance",
        description:
          "Transaction amounts encrypted on-chain via ZK proofs — only sender, receiver, and optional auditor see the value. Initialized but not yet enabled.",
      },
      {
        name: "Transfer hooks",
        category: "compliance",
        description:
          "Custom program invoked on every token transfer — enables fine-grained compliance logic, allowlist checks, or fee logic without separate contracts.",
      },
      {
        name: "Memo field transfers",
        category: "authorization",
        description:
          "Arbitrary memo data attached to each transfer — enables invoice IDs, order references, and reconciliation metadata natively.",
      },
      {
        name: "Permanent delegate — Paxos",
        category: "compliance",
        description:
          "Paxos holds permanent delegate authority to freeze or seize funds for NYDFS regulatory compliance — initialized at mint creation.",
      },
      {
        name: "LayerZero OFT burn-and-mint",
        category: "cross-chain",
        description:
          "Burn-and-mint bridge: PYUSD burned on source chain, minted on destination. No bridge liquidity pools — eliminates slippage and inflation risk.",
      },
      {
        name: "PayPal/Venmo unified balance",
        category: "compliance",
        description:
          "Users see a single dollar balance in PayPal and Venmo apps regardless of underlying chain.",
      },
      {
        name: "~4% APY on PYUSD (custodial)",
        category: "yield",
        description:
          "PayPal offers ~4% annual yield on PYUSD deposits (rate can change) — fiat yield competing with savings accounts.",
      },
    ],
    reserves: "USD deposits, US Treasuries, cash equivalents",
    collateralType: "Fiat (off-chain)",
    pegMechanism: "Hard 1:1 via Paxos redemption",
    auditor: "KPMG LLP (monthly attestation, effective Feb 2025)",
    defiIntegration: "Kamino, Marginfi (Solana); Aave (Ethereum); emerging",
    yield: "~4% APY via PayPal (custodial; rate variable)",
    risks: [
      { label: "Low liquidity vs USDT/USDC", level: "low" },
      { label: "Paxos regulatory dependency", level: "low" },
      { label: "Limited DeFi depth", level: "low" },
    ],
    technicalNotes:
      "6 decimals. Paxos extensions beyond standard EIPs: AuthorizationAlreadyUsed, InvalidNonceCount, PermitInvalidated events — extra safety rails around EIP-2612/3009. cancelPermits() admin-style nonce invalidation. Solana Token-2022 extensions: ConfidentialTransfers (ZK proofs, initialized but not active), TransferHooks (programmable per-transfer logic), RequiredMemoOnTransfer (compliance), PermanentDelegate (Paxos), TransferFeeConfig (0% currently). IMPORTANT: confidential transfers CANNOT be combined with transfer fees or transfer hooks simultaneously. Auditor upgraded from Withum to KPMG LLP (Big Four, Feb 2025).",
    docsUrl: "https://www.paypal.com/us/digital-wallet/pyusd",
  },
  {
    symbol: "frxUSD",
    name: "Frax USD",
    issuer: "Frax Finance",
    rank: 10,
    marketCap: "~$120M",
    type: "fiat",
    description:
      "Fully collateralized stablecoin launched December 2025 as the successor to the original FRAX stablecoin. Backed 1:1 by BlackRock's BUIDL fund (USD Institutional Digital Liquidity Fund, tokenized by Securitize) — investing in US Treasury bills, cash, and repo agreements. The original FRAX fractional-algorithmic model was retired. Note: the FRAX ticker now refers to the Frax Finance governance and gas token for the Fraxtal L2 network (formerly FXS).",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "Verify on official Frax docs — new contract post-December 2025 migration",
        isPrimary: true,
      },
      {
        name: "Fraxtal",
        chain: "fraxtal",
        standard: "ERC-20",
        contract: "Native on Fraxtal L2 — see Frax docs",
        isPrimary: false,
        notes: "Native on Frax-native L2",
      },
    ],
    features: [
      {
        name: "BlackRock BUIDL backing",
        category: "compliance",
        description:
          "100% backed by BlackRock USD Institutional Digital Liquidity Fund (BUIDL), tokenized by Securitize — invests in US Treasury bills, cash, and repo agreements.",
      },
      {
        name: "sfrxUSD ERC-4626 vault",
        category: "yield",
        eip: "ERC-4626",
        description:
          "Staked frxUSD earns yield from BUIDL's underlying US Treasury income, distributed via ERC-4626 standard vault.",
      },
      {
        name: "Fraxlend isolated pairs",
        category: "yield",
        description:
          "Isolated lending pairs with dynamic interest rates — each pair has independent liquidation risk.",
      },
      {
        name: "Fraxswap TWAMM",
        category: "stability",
        description:
          "Built-in AMM with Time-Weighted Average Market Maker — executes large orders gradually over time to minimise price impact.",
      },
    ],
    reserves: "BlackRock BUIDL fund (US Treasuries, cash, repo agreements) via Securitize tokenization",
    collateralType: "RWA — tokenized US Treasuries",
    pegMechanism: "Hard 1:1 via BUIDL fund redemption",
    auditor: "BlackRock/Securitize transparency reporting on BUIDL fund",
    defiIntegration: "Fraxswap, Fraxlend (native); early-stage external DeFi integrations",
    yield: "sfrxUSD variable — BUIDL fund US Treasury yield",
    risks: [
      { label: "Very small market cap — low liquidity", level: "high" },
      { label: "BUIDL fund custodial and redemption risk", level: "low" },
      { label: "Migration still in progress — verify contract addresses", level: "medium" },
    ],
    technicalNotes:
      "18 decimals. frxUSD can be minted 1:1 by depositing BlackRock BUIDL directly into mint contract (0xe827abf9f462ac4f147753d86bc5f91e186e4e9c) — first direct DeFi↔BlackRock tokenized asset integration. sfrxUSD (StakedFrxUSD) extends LinearRewardsErc4626: non-rebasing, share price increases. Benchmark Yield Strategy (BYS) dynamically allocates across carry-trade (Ethena/Superstate), DeFi AMOs (Aave/Curve/Convex/Euler/Fraxlend), and IORB/T-Bill RWA strategies. Redemption via FraxtalERC4626MintRedeemer: zero fees, zero price impact. Original FRAX fractional-algorithmic model retired.",
    docsUrl: "https://docs.frax.finance",
    githubUrl: "https://github.com/FraxFinance",
  },
  {
    symbol: "TUSD",
    name: "TrueUSD",
    issuer: "Techteryx Ltd.",
    rank: 8,
    marketCap: "~$494M",
    type: "fiat",
    description:
      "One of the earliest regulated stablecoins (2018). Acquired by Techteryx Ltd. (BVI) in 2020; Archblock (formerly TrueCoin), the original operator, filed for Chapter 11 bankruptcy in 2025. TUSD is under significant legal and financial stress: $456M in reserves were locked in an illiquid offshore fund (Cayman-based Aria Commodity Finance Fund) and a Dubai court issued a global freezing order on those assets in November 2025. TrueCoin and TrustToken settled with the SEC in September 2024 for fraud charges related to falsely marketing TUSD as fully dollar-backed. Real-time attestations have been suspended/unreliable. The peg has been maintained only due to a ~$500M bailout by Justin Sun.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x0000000000085d4780B73119b644AE5ecd22b376",
        isPrimary: true,
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "BEP-20",
        contract: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
        isPrimary: false,
        notes: "Highest volume",
      },
      {
        name: "TRON",
        chain: "tron",
        standard: "TRC-20",
        contract: "TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4",
        isPrimary: false,
      },
      {
        name: "Avalanche",
        chain: "avalanche",
        standard: "ERC-20",
        contract: "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB",
        isPrimary: false,
      },
    ],
    features: [
      {
        name: "Real-time on-chain attestation",
        category: "compliance",
        description:
          "The Network Firm provides real-time reserve attestations visible directly on-chain — first stablecoin to implement this.",
      },
      {
        name: "Chainlink Proof of Reserve",
        category: "compliance",
        description:
          "Chainlink PoR publishes reserve data to an on-chain aggregator contract — machine-readable and verifiable by any smart contract.",
      },
      {
        name: "Multi-bank escrow",
        category: "compliance",
        description:
          "Funds held across multiple trust accounts at different banking partners — reduces single-bank concentration risk.",
      },
      {
        name: "Asset protection freeze",
        category: "compliance",
        description:
          "Issuer can freeze individual accounts for regulatory compliance via ERC-20 admin function.",
      },
    ],
    reserves: "USD held in trust across multiple banking partners",
    collateralType: "Fiat (off-chain)",
    pegMechanism: "Hard 1:1 via trust company redemption",
    auditor: "The Network Firm (real-time attestations suspended — unreliable as of 2025)",
    defiIntegration: "Limited — PancakeSwap (BNB), select DEXes",
    yield: "None",
    risks: [
      { label: "$456M reserves frozen by Dubai court — Nov 2025", level: "high" },
      { label: "SEC fraud settlement — TrueCoin/TrustToken Sept 2024", level: "high" },
      { label: "Archblock (operator) Chapter 11 bankruptcy 2025", level: "high" },
      { label: "Attestations suspended — reserve transparency unreliable", level: "high" },
      { label: "Peg depends on Justin Sun bailout, not reserve backing", level: "high" },
      { label: "Declining exchange support and MiCA delisting", level: "medium" },
    ],
    technicalNotes:
      "18 decimals. Proxy address 0x0000000000085d4780B73119b644AE5ecd22b376 uses deliberate leading zeros (vanity deployment) — can confuse address parsers. Implementation 0xDBC97a631c2fee80417d5d69f32b198c8c39c27e. TrueCurrencyWithLegacyAutosweep inheritance chain. Deprecated TrueReward feature (per-account interest toggle) — legacy code remains. Controller proxy pattern is NOT standard EIP-1967 — proxy detection tooling may mislabel. $456M reserves stuck in unauthorized illiquid investments ('large-scale fraud' per court filings). Peg maintained by Justin Sun $456M bailout. Attestations suspended.",
    docsUrl: "https://tusd.io",
  },
  {
    symbol: "USD1",
    name: "World Liberty Financial USD1",
    issuer: "World Liberty Financial (WLFI)",
    rank: 5,
    marketCap: "~$4.6B",
    type: "fiat",
    description:
      "Fastest-growing stablecoin of 2025 — announced March 2025 and went live around April 2025 (sources vary). Reached $4.7B by February 2026 via Binance and Abu Dhabi MGX partnerships. Backed 1:1 by USD, US Treasuries, and cash equivalents, custodied by BitGo. In February 2026, USD1 briefly de-pegged to $0.98 in what WLFI described as a coordinated attack; it recovered within hours. WLFI launched World Liberty Markets (lending platform using USD1) in January 2026 and an AI payments SDK in March 2026.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        isPrimary: true,
        notes: "TransparentUpgradeableProxy (EIP-1967)",
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "BEP-20",
        contract: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
        isPrimary: true,
        notes: "Same address as Ethereum",
      },
      {
        name: "Solana",
        chain: "solana",
        standard: "SPL",
        contract: "See official WLFI docs for Solana mint address",
        isPrimary: false,
      },
      {
        name: "TRON",
        chain: "tron",
        standard: "TRC-20",
        contract: "See official WLFI docs for TRON contract",
        isPrimary: false,
      },
    ],
    features: [
      {
        name: "BitGo qualified custody",
        category: "compliance",
        description:
          "USD reserves and Treasuries held by BitGo Trust Company (South Dakota chartered trust) — regulated qualified custodian for institutional assets.",
      },
      {
        name: "Chainlink real-time Proof of Reserves",
        category: "compliance",
        description:
          "Chainlink PoR oracle pulls live BitGo custody data on-chain, updating reserve ratios in real time — any contract can verify backing without trusting WLFI.",
      },
      {
        name: "BitGo monthly attestations",
        category: "compliance",
        description:
          "BitGo publishes monthly reserve attestation reports examined by an independent accounting firm per AICPA criteria.",
      },
      {
        name: "Multi-chain deployment",
        category: "cross-chain",
        description:
          "Deployed on Ethereum, BNB Chain, Solana, and TRON — expanding cross-chain presence.",
      },
      {
        name: "Institutional partner focus",
        category: "compliance",
        description:
          "Targets sovereign and institutional capital — traction via Binance and Abu Dhabi's MGX.",
      },
      {
        name: "Standard ERC-20/BEP-20 admin",
        category: "compliance",
        description:
          "Mint, burn, and freeze admin functions following standard issuer-controlled stablecoin pattern.",
      },
    ],
    reserves: "USD, US Treasuries, cash equivalents — BitGo custody",
    collateralType: "Fiat and Treasuries (off-chain)",
    pegMechanism: "Hard 1:1 via issuer redemption",
    auditor: "BitGo (monthly attestation) + Chainlink real-time Proof of Reserves",
    defiIntegration: "CEX only — Binance, select exchanges",
    yield: "None",
    risks: [
      { label: "Political and regulatory exposure", level: "high" },
      { label: "Centralisation", level: "medium" },
      { label: "New issuer limited track record", level: "high" },
      { label: "No DeFi depth", level: "medium" },
    ],
    technicalNotes:
      "18 decimals. Source code public at worldliberty/usd1-smart-contracts (Foundry/Solidity). TransparentUpgradeableProxy (EIP-1967) confirmed. Conforms to EIP-20, EIP-712, EIP-2612. Freeze capability. Contract address 0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d on EVM chains. Deployed across 11 networks: Ethereum, BNB, Plume, Monad, Mantle, Morph, XLayer, Solana, TRON, Aptos. Monthly AICPA attestations (2025 criteria). Notable gap: no formal smart contract security audit from a recognized firm publicly disclosed.",
  },
  {
    symbol: "GHO",
    name: "GHO",
    issuer: "Aave DAO",
    rank: 11,
    marketCap: "~$584M",
    type: "crypto",
    description:
      "Aave-native decentralised stablecoin launched July 2023. GHO is minted by borrowers on Aave V3 against over-collateralised positions — it is never supplied, only created. Supply is governed by a facilitator model: each approved facilitator (Aave V3, FlashMinter, GSM) has a governance-set bucket capacity controlling the maximum GHO it can mint. Cross-chain via Chainlink CCIP (lock-and-mint from Ethereum, burn-and-mint between L2s). Peg stability maintained by GSM (1:1 USDC/USDT swaps), borrow rate tuning, and arbitrage incentives.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
        isPrimary: true,
        notes: "Non-proxied immutable contract, 18 decimals",
      },
      {
        name: "Arbitrum",
        chain: "arbitrum",
        standard: "ERC-20",
        contract: "0x7dfF72693f6A4149b17e7C6314655f6A9F7c8B33",
        isPrimary: false,
        notes: "UpgradeableGhoToken via CCIP burn-and-mint",
      },
      {
        name: "Base",
        chain: "base",
        standard: "ERC-20",
        contract: "0x6Bb7a212910682DCFdbd5BCBb3e28FB4E8da10Ee",
        isPrimary: false,
        notes: "UpgradeableGhoToken via CCIP burn-and-mint",
      },
      {
        name: "Avalanche",
        chain: "avalanche",
        standard: "ERC-20",
        contract: "0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73",
        isPrimary: false,
        notes: "UpgradeableGhoToken via CCIP burn-and-mint",
      },
      {
        name: "Gnosis",
        chain: "gnosis",
        standard: "ERC-20",
        contract: "0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73",
        isPrimary: false,
        notes: "UpgradeableGhoToken via CCIP burn-and-mint",
      },
      {
        name: "Mantle",
        chain: "mantle",
        standard: "ERC-20",
        contract: "0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73",
        isPrimary: false,
        notes: "UpgradeableGhoToken via CCIP burn-and-mint",
      },
    ],
    features: [
      {
        name: "Facilitator model — mint/burn",
        category: "governance",
        description:
          "GHO supply controlled by approved facilitators (Aave V3, FlashMinter, GSM) each with governance-set bucket capacities. Only facilitators can mint/burn — no centralised issuer.",
      },
      {
        name: "EIP-2612 permit()",
        category: "authorization",
        description:
          "Standard sequential-nonce permit for gasless approvals via off-chain EIP-712 signatures. Built into the custom Solmate-derived ERC20 base.",
      },
      {
        name: "ERC-3156 FlashMint facilitator",
        category: "authorization",
        description:
          "Dedicated GhoFlashMinter contract implements ERC-3156 flash loan interface — mints GHO atomically within a single transaction for arbitrage, liquidations, and debt switches.",
      },
      {
        name: "GHO Stability Module (GSM)",
        category: "stability",
        description:
          "Peg stability via 1:1 swaps between GHO and approved exogenous tokens (USDC, USDT). Each GSM instance is a facilitator with exposure caps, fee strategies, and oracle-driven freeze capability.",
      },
      {
        name: "CCIP cross-chain bridging",
        category: "cross-chain",
        description:
          "Chainlink CCIP enables lock-and-mint (Ethereum) and burn-and-mint (L2↔L2) transfers across Arbitrum, Base, Avalanche, Gnosis, and Mantle.",
      },
      {
        name: "stkGHO staking",
        category: "yield",
        description:
          "Staked GHO (stkGHO) earns AAVE rewards via StakeToken contract. Includes cooldown/unstake window, slashing mechanism for Aave safety module. Not ERC-4626.",
      },
      {
        name: "stkAAVE discount rate",
        category: "yield",
        description:
          "stkAAVE holders receive a discounted GHO borrow rate on Aave V3 — incentivises AAVE staking and GHO adoption simultaneously.",
      },
      {
        name: "Governance-controlled parameters",
        category: "governance",
        description:
          "Borrow rate, facilitator caps, GSM fees, and CCIP rate limits all adjustable by Aave Governance and GHO Stewards (3-of-4 multisig from Risk, Growth, and Finance service providers).",
      },
    ],
    reserves:
      "Over-collateralised via Aave V3 (ETH, WBTC, wstETH, USDC, etc.) plus GSM holdings (USDC, USDT). No off-chain reserves — fully on-chain collateral.",
    collateralType: "On-chain crypto (Aave V3 collateral pool)",
    pegMechanism:
      "Borrow rate adjustment + GSM 1:1 swaps + arbitrage incentives. GHO Stewards can adjust borrow rate ±500bps per 2-day period if 30-day average price deviates from $0.995–$1.005.",
    auditor: "SigmaPrime, OpenZeppelin (CCIP integration)",
    defiIntegration:
      "Deep Aave V3 integration (borrow, repay, liquidation), Curve, Balancer, Uniswap GHO pools",
    yield: "stkGHO staking rewards (AAVE), stkAAVE discount on borrow rate",
    risks: [
      { label: "Smart contract risk (multi-contract architecture)", level: "medium" },
      { label: "Collateral volatility", level: "medium" },
      { label: "Governance attack vector", level: "medium" },
      { label: "Peg stability (new mechanism)", level: "medium" },
      { label: "Cross-chain bridge risk (CCIP)", level: "low" },
    ],
    technicalNotes:
      "18 decimals. Ethereum mainnet GHO is a non-proxied immutable contract (Solmate-derived ERC20 + OZ AccessControl). L2 deployments use UpgradeableGhoToken (proxy-based, Initializable). Custom ERC20 base from Solmate — gas-optimised with built-in EIP-2612 permit() and EIP-712 DOMAIN_SEPARATOR. No EIP-3009 transferWithAuthorization. No freeze, seize, or pause on the GHO token itself — fully permissionless transfers. Flash mints via separate GhoFlashMinter facilitator (ERC-3156). GSM4626 variant supports ERC-4626 vault shares as exogenous token. CCIP cross-chain uses GhoCCIPTokenPoolEthereum (lock/release on L1) and GhoCCIPTokenPool (burn/mint on L2s). AccessControl roles: DEFAULT_ADMIN_ROLE (Aave Governance), FACILITATOR_MANAGER_ROLE, BUCKET_MANAGER_ROLE.",
    docsUrl: "https://docs.gho.xyz/",
    githubUrl: "https://github.com/aave/gho-core",
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    issuer: "Standard Custody & Trust Company, LLC (Ripple subsidiary)",
    rank: 12,
    marketCap: "~$1.4B",
    type: "fiat",
    description:
      "Ripple's USD-backed stablecoin, approved by NYDFS and DFSA (Dubai). Launched December 2024, natively issued on Ethereum and XRP Ledger. Purpose-built for cross-border payments with six-role access control (admin, minter, burner, pauser, clawbacker, upgrader), account-level freeze, clawback (seize), and UUPS upgradeability. V2 upgrade (September 2025) added EIP-2612 gasless permit.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD",
        isPrimary: true,
        notes: "UUPS proxy (StablecoinUpgradeableV2), 18 decimals",
      },
      {
        name: "XRP Ledger",
        chain: "xrpl",
        standard: "IOU (Issued Currency)",
        contract: "Issuer: rMxWzuz9LHEFhJgjAB1mfPNHBCnrHTmDjg",
        isPrimary: true,
        notes: "Native issued currency, not EVM",
      },
    ],
    features: [
      {
        name: "EIP-2612 permit()",
        category: "authorization",
        eip: "EIP-2612",
        description:
          "Gasless approval via signed message. Added in V2 upgrade (September 2025). Compliance-gated — reverts if owner, spender, or msg.sender is frozen, or if contract is globally paused.",
      },
      {
        name: "Account freeze",
        category: "compliance",
        description:
          "PAUSER_ROLE can freeze individual addresses via pauseAccounts(address[]). Frozen accounts cannot send, receive, or approve. Custom AccountPausableUpgradeable with ERC-7201 namespaced storage.",
      },
      {
        name: "Clawback (seize)",
        category: "compliance",
        description:
          "CLAWBACKER_ROLE can burn tokens from any address including frozen accounts via clawback(address, uint256). More powerful than USDC's freeze-only — tokens are permanently destroyed.",
      },
      {
        name: "Global pause",
        category: "compliance",
        description:
          "PAUSER_ROLE can halt ALL transfers, mints, burns, approvals, and permits contract-wide via pause()/unpause().",
      },
      {
        name: "UUPS upgradeable",
        category: "compliance",
        description:
          "UPGRADER_ROLE can upgrade implementation via upgradeToAndCall(). Already upgraded V1 → V2 (September 2025) to add EIP-2612 permit support.",
      },
      {
        name: "Six-role access control",
        category: "compliance",
        description:
          "OpenZeppelin AccessControl with DEFAULT_ADMIN, MINTER, BURNER, PAUSER, CLAWBACKER, UPGRADER roles. BURNER (self-burn for redemption) and CLAWBACKER (seize from any address) are separate capabilities.",
      },
    ],
    reserves:
      "100% backed by USD deposits, U.S. Treasury Bills, and cash equivalents held in segregated accounts. Primary custody by BNY Mellon (since July 2025). Monthly third-party attestations.",
    collateralType: "Fiat and equivalents (off-chain)",
    pegMechanism: "Hard 1:1 via centralized issuer redemption",
    auditor: "Third-party monthly attestations (ripple.com/solutions/stablecoin/transparency/)",
    defiIntegration:
      "Early-stage — exchange listings (Binance, Bitso, LMAX), BlackRock BUIDL redemption mechanism, SBI Japan integration",
    yield: "None native",
    risks: [
      { label: "Centralization (six-role admin)", level: "medium" },
      { label: "Regulatory exposure", level: "low" },
      { label: "Clawback — tokens can be seized and destroyed", level: "medium" },
      { label: "18-decimal integration risk vs 6-decimal norm", level: "medium" },
    ],
    technicalNotes:
      "18 decimals (unlike USDC/USDT/PYUSD which use 6 — critical integration difference). UUPS proxy (EIP-1822) with ERC-1967 storage slots. StablecoinProxy (Solidity 0.8.26, OZ v5) wraps StablecoinUpgradeableV2 (Solidity 0.8.29, OZ v5.3.0). V2 adds ERC20PermitUpgradeable. Custom AccountPausableUpgradeable uses ERC-7201 namespaced storage. V2's _update() override allows clawback from frozen accounts while blocking normal transfers. No EIP-3009, no EIP-1271, no flash loans. Role hashes: MINTER=keccak256('MINTER'), BURNER=keccak256('BURNER'), PAUSER=keccak256('PAUSER'), CLAWBACKER=keccak256('CLAWBACKER'), UPGRADER=keccak256('UPGRADER'). Security contact: security@ripple.com.",
    docsUrl: "https://ripple.com/solutions/stablecoin/",
    githubUrl: "https://github.com/ripple/RLUSD-Implementation",
  },
]

export const coinBySymbol = Object.fromEntries(
  coins.map((c) => [c.symbol.toUpperCase(), c])
) as Record<string, Coin>
