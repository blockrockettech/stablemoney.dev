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
        notes: "~96B supply, 13M+ holders",
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
    reserves: "US Treasury bills (~$135B+), money market funds, repo agreements, gold (~$13B), Bitcoin (~$5B+), other assets",
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
      "Ethereum contract is a custom ERC-20 (non-upgradeable) with owner-controlled pause, blacklist mapping, issue and redeem functions. USDT0 on Arbitrum/op-chains uses LayerZero OFT standard — 1:1 backed by canonical USDT locked on Ethereum. TRON TRC-20 mirrors the functional pattern.",
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
      "FiatToken v2.2 contract pattern used across all EVM deployments. Admin roles: Owner, MasterMinter, Blacklister, Pauser. The allowance mapping supports both approve and permit. CCTP contracts: TokenMessenger (mint/burn coordinator), MessageTransmitter (cross-chain messaging). Critical distinction: native USDC vs bridged USDC.e — always confirm native address per chain before integrating.",
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
      "Core contracts — EthenaMinting.sol (mint/redeem with EIP-712 signed orders), StakedUSDe.sol (ERC-4626 vault with 7-day unstaking cooldown), USDe.sol (ERC-20 plus EIP-2612 permit). Mint flow: user signs EIP-712 order → relayer submits → atomic collateral swap → USDe minted in same block. Off-exchange settlement custodians: Copper ClearLoop, Ceffu (Binance institutional), Fireblocks, Anchorage Digital Bank, Kraken Custody (added January 2026). October 2025 flash crash caused brief $0.65 price on thin Binance order book — on-chain Curve pool maintained peg throughout.",
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
          "US Treasuries and private credit held in off-chain SPVs contribute to collateral pool (~$948M RWA backing).",
      },
      {
        name: "Decentralised oracle — Medianizer",
        category: "stability",
        description:
          "Median of whitelist oracle feeds used for collateral price — resistant to single oracle manipulation.",
      },
    ],
    reserves: "ETH (~40%), stETH, WBTC, RWAs (~$948M), USDC via PSM",
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
      "MCD core contracts — Vat.sol (central accounting ledger for collateral and debt), Jug.sol (stability fee accumulator), Dog.sol (liquidation trigger), Clip.sol (Dutch auction liquidator), Pot.sol (DSR savings), Cat.sol (legacy liquidator). DAI is a standard immutable ERC-20. PSM: call gemJoin to swap USDC→DAI fee-less. Oracle: Medianizer aggregates from whitelisted price feeds. MKR→SKY migration ratio 1:24,000.",
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
      "USDS is an IOU token in the MCD Vat, technically identical to DAI in backing. DaiUsds.sol: call daiToUsds(address, amount) or usdsToDai(address, amount) for 1:1 swap. sUSDS is ERC-4626 and accumulates SSR continuously. Upgrade path requires on-chain governance vote via spell with timelock.",
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
      "Standard ERC-20/BEP-20 with issuer admin — mint, burn, blacklist. EIP-3009 BSC upgrade (Dec 2025) adds transferWithAuthorization function for gasless BNB Chain transfers. Chainlink oracle: FDUSD/USD price feed on BNB Chain mainnet. Always verify contract address on official docs before integration.",
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
        name: "3.7% APY on PYUSD",
        category: "yield",
        description:
          "PayPal announced 3.7% annual yield on PYUSD deposits (2026) — fiat yield competing with savings accounts.",
      },
    ],
    reserves: "USD deposits, US Treasuries, cash equivalents",
    collateralType: "Fiat (off-chain)",
    pegMechanism: "Hard 1:1 via Paxos redemption",
    auditor: "KPMG LLP (monthly attestation, effective Feb 2025)",
    defiIntegration: "Kamino, Marginfi (Solana); Aave (Ethereum); emerging",
    yield: "3.7% APY via PayPal (custodial)",
    risks: [
      { label: "Low liquidity vs USDT/USDC", level: "low" },
      { label: "Paxos regulatory dependency", level: "low" },
      { label: "Limited DeFi depth", level: "low" },
    ],
    technicalNotes:
      "Ethereum — ERC-20 FiatToken (Paxos standard) with assetProtection (freeze), supplyController (mint/burn), pausing. Solana — Token-2022 program address: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb. Initialized extensions at mint creation: ConfidentialTransferMint (not yet active), TransferHookAccount (null program for future use), PermanentDelegate (Paxos authority), TransferFeeConfig (0% currently), MemoTransfer. LayerZero escrow on Solana: 6JHAfeFjJLrn9enjvBUsmqLSy8B8Wyobr4uXuPVKyjhT. Devnet contract: CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM.",
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
      "Launched December 2025 following Frax Finance restructuring. frxUSD is fully collateralized by BlackRock BUIDL, a tokenized money market fund managed by BlackRock and tokenized by Securitize on Ethereum. The original fractional-algorithmic FRAX model is retired. FRAX ticker (formerly FXS) is now the governance and gas token for Fraxtal L2. Always verify the canonical frxUSD contract address from official Frax Finance docs before integrating — new contracts were deployed post-migration.",
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
      "TUSD uses a Controller proxy pattern — indirection pointing to implementation. The TrueReward mechanism (legacy feature) allowed per-account interest toggling via a flag in the balance struct. Chainlink PoR: reserves were published at regular intervals to an on-chain AggregatorV3Interface contract, but real-time attestations have been suspended amid the reserve controversy. Integrations should treat TUSD reserve transparency as unreliable until fully resolved.",
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
      "Fastest-growing stablecoin of 2025 — launched by WLFI (Trump-family-linked project) in March 2025. Reached $4.7B by February 2026 via Binance and Abu Dhabi MGX partnerships. Backed 1:1 by USD, US Treasuries, and cash equivalents, custodied by BitGo. In February 2026, USD1 briefly de-pegged to $0.98 in what WLFI described as a coordinated attack; it recovered within hours. WLFI launched World Liberty Markets (lending platform using USD1) in January 2026 and an AI payments SDK in March 2026.",
    networks: [
      {
        name: "Ethereum",
        chain: "ethereum",
        standard: "ERC-20",
        contract: "0x0000000000000000000000000000000000000000",
        isPrimary: true,
        notes:
          "Placeholder — verify canonical address on Etherscan from official WLFI sources before integration.",
      },
      {
        name: "BNB Chain",
        chain: "bnb",
        standard: "BEP-20",
        contract: "0x0000000000000000000000000000000000000000",
        isPrimary: true,
        notes:
          "Placeholder — verify canonical address on BscScan from official WLFI sources before integration.",
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
      "Standard ERC-20/BEP-20 with mint/burn/freeze admin. Always verify contract addresses on Etherscan and BscScan from official WLFI sources before any integration — do not use addresses from unofficial sources. Early-stage transparency — full due diligence recommended.",
  },
]

export const coinBySymbol = Object.fromEntries(
  coins.map((c) => [c.symbol.toUpperCase(), c])
) as Record<string, Coin>
