import type { Feature } from "@/types"

/** Per-feature developer metadata keyed by coin symbol → feature name (must match `coins.ts`). */
type Extra = Partial<
  Omit<Feature, "name" | "description" | "category">
> & { rationale?: string; riskNotes?: string }

const EIP = (n: number) => `https://eips.ethereum.org/EIPS/eip-${n}`
const ERC = EIP

export const FEATURE_DETAILS: Record<string, Record<string, Extra>> = {
  USDT: {
    "Blacklist/Freeze": {
      audience: "corporate",
      standards: ["Admin controls (non-EIP)"],
      rationale:
        "Integrations must assume `transfer` can revert for sanctioned or frozen addresses — design UIs and custody flows accordingly.",
      riskNotes:
        "Censorship risk and sudden loss of spendability; not suitable for permissionless censorship resistance guarantees.",
      links: [
        { label: "Tether transparency", url: "https://tether.to/en/transparency/" },
      ],
    },
    "Cross-chain native via OFT": {
      audience: "both",
      standards: ["LayerZero OFT"],
      rationale:
        "USDT0 on L2s uses OFT for native burn/mint semantics — prefer OFT interfaces over legacy bridge-wrapped USDT when routing liquidity.",
      riskNotes:
        "Misconfigured OFT peers or stale LayerZero endpoint IDs can strand or duplicate accounting across chains.",
      links: [
        { label: "LayerZero OFT docs", url: "https://docs.layerzero.network/v2/developers/evm/oft/quickstart" },
      ],
    },
    "ERC-20 standard": {
      audience: "user",
      standards: ["ERC-20", "EIP-20"],
      rationale:
        "EVM integrations use standard `transfer`/`approve` plus Tether-specific admin hooks — treat as ERC-20 with extra revert cases.",
      riskNotes:
        "Non-standard edge cases vs reference OpenZeppelin ERC-20; always test pause/blacklist paths.",
      links: [
        { label: "EIP-20 spec", url: ERC(20) },
        {
          label: "Verified contract (Ethereum)",
          url: "https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7#code",
        },
      ],
    },
    "TRC-20 high-volume deployment": {
      audience: "user",
      standards: ["TRC-20"],
      rationale:
        "Highest retail and CEX flow lives on TRON — integrations targeting fees/UX must support TRC-20 semantics and energy model.",
      riskNotes:
        "Different address format and fee model vs EVM; operational mistakes lose funds.",
      links: [
        { label: "TRON TRC-20 overview", url: "https://developers.tron.network/docs/trc20" },
        {
          label: "Contract (Tronscan)",
          url: "https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        },
      ],
    },
    "Daily reserve reports": {
      audience: "corporate",
      rationale:
        "Attestations underpin reserve narrative for compliance and listings — useful for off-chain risk monitoring, not on-chain proof of backing per se.",
      riskNotes:
        "Attestation scope and methodology can change; not a substitute for your own risk policy.",
      links: [
        { label: "Tether transparency", url: "https://tether.to/en/transparency/" },
      ],
    },
    "Issuer mint/burn": {
      audience: "corporate",
      standards: ["Centralized mint/burn"],
      rationale:
        "Supply changes reflect issuer operations — indexers should track `Issue`/`Redeem` events where exposed, not assume fixed emission rules.",
      riskNotes:
        "Supply shocks and operational errors originate off-chain; on-chain supply is authoritative for circulation only.",
      links: [
        {
          label: "Verified contract (Ethereum)",
          url: "https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7#code",
        },
      ],
    },
  },

  USDC: {
    "EIP-2612 permit()": {
      audience: "user",
      standards: ["EIP-2612", "ERC-20"],
      rationale:
        "Enables gasless approvals via signature — critical for one-tx flows in DeFi; wallet must support typed data signing.",
      riskNotes:
        "Permit replay/nonce bugs in your app can drain allowances; pin domain separator and deadline handling.",
      links: [
        { label: "EIP-2612", url: EIP(2612) },
        {
          label: "Circle: USDC on Ethereum",
          url: "https://developers.circle.com/stablecoins/usdc-on-main-networks",
        },
        {
          label: "Verified FiatToken (Ethereum)",
          url: "https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48#code",
        },
      ],
    },
    "EIP-3009 transferWithAuthorization": {
      audience: "user",
      standards: ["EIP-3009", "ERC-20"],
      rationale:
        "Supports meta-transfers and payment APIs with ephemeral nonces — used for gas abstraction and commerce patterns.",
      riskNotes:
        "Nonce reuse and signature replay are catastrophic; centralize nonce tracking per authorizer.",
      links: [
        { label: "EIP-3009", url: EIP(3009) },
        {
          label: "Circle developer docs",
          url: "https://developers.circle.com/stablecoins/docs",
        },
      ],
    },
    "Permit2 compatible": {
      audience: "user",
      standards: ["Permit2 (Uniswap)"],
      rationale:
        "Lets protocols unify allowance management across tokens — reduces approval UX friction when combined with Permit2 router patterns.",
      riskNotes:
        "Permit2 contract allowances are powerful; verify spender contracts and expiries.",
      links: [
        { label: "Permit2 repo", url: "https://github.com/Uniswap/permit2" },
      ],
    },
    "CCTP v2 cross-chain": {
      audience: "both",
      standards: ["CCTP"],
      rationale:
        "Burn/mint native USDC across domains without liquidity pools — preferred vs bridged USDC.e for new integrations.",
      riskNotes:
        "Must use correct TokenMessenger/MessageTransmitter addresses per domain; wrong domain config bricks flows.",
      links: [
        {
          label: "CCTP developer docs",
          url: "https://developers.circle.com/stablecoins/docs/cctp-getting-started",
        },
      ],
    },
    "Blacklist and Pause": {
      audience: "corporate",
      rationale:
        "FiatToken admin can freeze addresses or pause globally — custody and DeFi protocols must surface failures to users.",
      riskNotes:
        "Regulatory and operational freezes are opaque to pure smart-contract logic; plan for sudden illiquidity.",
      links: [
        {
          label: "Verified proxy (Ethereum)",
          url: "https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48#code",
        },
      ],
    },
    "TransparentUpgradeableProxy": {
      audience: "corporate",
      standards: ["ERC-1967", "proxy pattern"],
      rationale:
        "Implementation can be upgraded — monitor implementation changes and diff bytecode on upgrades for breaking behavior.",
      riskNotes:
        "Governance/compromise of admin can alter token logic; dependency risk for deep integrations.",
      links: [
        { label: "EIP-1967", url: EIP(1967) },
        {
          label: "OpenZeppelin proxies",
          url: "https://docs.openzeppelin.com/contracts/4.x/api/proxy",
        },
      ],
    },
    "SEC-registered reserve fund": {
      audience: "corporate",
      rationale:
        "Reserve composition is disclosed for regulatory and institutional users — informs treasury policy, not on-chain settlement guarantees.",
      riskNotes:
        "Off-chain fund and banking risk remains; not convertible 1:1 on-chain without issuer rails.",
      links: [
        { label: "Circle USDC", url: "https://www.circle.com/usdc" },
      ],
    },
    "Gasless meta-transactions": {
      audience: "user",
      standards: ["EIP-3009", "EIP-712"],
      rationale:
        "Relayers submit signed `transferWithAuthorization` — enables sponsored gas for end users when relayer is trusted.",
      riskNotes:
        "Relayer compromise or bad fee logic can censor or reorder; users must verify domain separation.",
      links: [
        { label: "EIP-712", url: EIP(712) },
        { label: "EIP-3009", url: EIP(3009) },
      ],
    },
  },

  USDe: {
    "Delta-neutral peg mechanism": {
      audience: "both",
      rationale:
        "Peg is engineering/economics of hedge + collateral, not bank redemption — model risk from derivatives and custodial workflows.",
      riskNotes:
        "Stress in funding, basis, or exchange connectivity can break peg assumptions on secondary markets.",
      links: [{ label: "Ethena docs", url: "https://docs.ethena.fi" }],
    },
    "ERC-4626 vault — sUSDe": {
      audience: "user",
      standards: ["ERC-4626"],
      rationale:
        "sUSDe accrues yield in vault shares — integrate with standard ERC-4626 preview/deposit/withdraw interfaces.",
      riskNotes:
        "Cooldowns and slashing-like events are protocol-specific; read StakedUSDe constraints.",
      links: [
        { label: "EIP-4626", url: EIP(4626) },
        { label: "Ethena GitHub", url: "https://github.com/ethena-labs" },
      ],
    },
    "Funding rate yield": {
      audience: "user",
      rationale:
        "Yield is not a fixed APY — driven by perp funding; systems displaying yield need live or conservative estimates.",
      riskNotes:
        "Negative funding can erode returns or stress hedges; CEX dependency matters.",
      links: [{ label: "Ethena docs", url: "https://docs.ethena.fi" }],
    },
    "ETH staking layer yield": {
      audience: "user",
      rationale:
        "LST yield stacks with funding — understand which LSTs are accepted and oracle treatment.",
      riskNotes:
        "LST depeg or slashing flows to protocol risk.",
      links: [{ label: "Ethena GitHub", url: "https://github.com/ethena-labs" }],
    },
    "Off-exchange settlement custody": {
      audience: "corporate",
      rationale:
        "Collateral movement uses institutional settlement rails — relevant for risk teams mapping counterparty exposure.",
      riskNotes:
        "Counterparty and operational failure modes are off-chain; not visible in token contract alone.",
      links: [{ label: "Ethena docs", url: "https://docs.ethena.fi" }],
    },
    "LayerZero OFT cross-chain": {
      audience: "both",
      standards: ["LayerZero OFT"],
      rationale:
        "Cross-chain USDe uses OFT — integrate LayerZero endpoints and peer configs like other OFT assets.",
      riskNotes:
        "Endpoint misconfiguration can cause loss of fungibility across chains.",
      links: [
        { label: "LayerZero docs", url: "https://docs.layerzero.network/" },
      ],
    },
    "Permissioned mint/redeem": {
      audience: "corporate",
      rationale:
        "Primary mint/redeem may be allowlisted — most DeFi users interact via AMM secondary markets instead.",
      riskNotes:
        "KYC gates change who can arb peg; liquidity path risk for retail.",
      links: [{ label: "Ethena docs", url: "https://docs.ethena.fi" }],
    },
    "EIP-712 signed mint orders": {
      audience: "user",
      standards: ["EIP-712"],
      rationale:
        "Mint path uses typed structured data signatures — wallets must implement correct EIP-712 domain for Ethena contracts.",
      riskNotes:
        "Signature bugs are high severity; test on testnets with official domains.",
      links: [
        { label: "EIP-712", url: EIP(712) },
        { label: "Ethena GitHub", url: "https://github.com/ethena-labs" },
      ],
    },
  },

  DAI: {
    "Multi-collateral vaults": {
      audience: "both",
      rationale:
        "DAI is minted from Maker/Sky vaults — integrations with leverage need to understand collateral types and liquidation math.",
      riskNotes:
        "Collateral parameters change via governance; assumptions decay without monitoring.",
      links: [
        { label: "Sky docs", url: "https://docs.sky.money/" },
        { label: "MakerDAO GitHub", url: "https://github.com/makerdao" },
      ],
    },
    "DAI Savings Rate — DSR": {
      audience: "user",
      standards: ["DSR Pot"],
      rationale:
        "Protocol-native yield for holding DAI — integrate Pot contract or Spark interfaces depending on deployment.",
      riskNotes:
        "DSR rate changes with governance; not a fixed yield product.",
      links: [
        { label: "Sky docs", url: "https://docs.sky.money/" },
        {
          label: "DAI token (Etherscan)",
          url: "https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F#code",
        },
      ],
    },
    "Liquidation auctions — Dog/Clip": {
      audience: "both",
      rationale:
        "Undercollateralized vaults liquidate via auction — relevant for keepers and risk dashboards, not typical transfers.",
      riskNotes:
        "Oracle or market shocks can cascade liquidations; MEV and gas spikes affect execution.",
      links: [
        { label: "Sky docs", url: "https://docs.sky.money/" },
        { label: "MakerDAO GitHub", url: "https://github.com/makerdao" },
      ],
    },
    "On-chain governance via SKY": {
      audience: "both",
      rationale:
        "Protocol risk parameters are voted on-chain — long-lived integrations should track spells and executive votes.",
      riskNotes:
        "Governance attacks or voter apathy can change collateral and oracle behavior.",
      links: [{ label: "Sky governance", url: "https://sky.money/" }],
    },
    "Peg Stability Module — PSM": {
      audience: "both",
      rationale:
        "PSM enables near-par swaps with whitelisted stablecoins — primary on-chain peg arbitrage lever for integrators.",
      riskNotes:
        "Inventory and fee parameters change; USDC PSM exposure links to Circle risk indirectly.",
      links: [{ label: "Sky docs", url: "https://docs.sky.money/" }],
    },
    "Real-world asset integration": {
      audience: "corporate",
      rationale:
        "RWA collateral introduces off-chain legal and reporting dependencies beyond pure crypto price feeds.",
      riskNotes:
        "RWA counterparty and legal structure risk; oracle latency vs off-chain marks.",
      links: [{ label: "Sky docs", url: "https://docs.sky.money/" }],
    },
    "Decentralised oracle — Medianizer": {
      audience: "both",
      rationale:
        "Prices feed liquidations — integrations relying on DAI price should understand oracle sources and delays.",
      riskNotes:
        "Oracle manipulation or STETH-style feed issues can misprice collateral.",
      links: [
        { label: "Chronicle (oracle ecosystem)", url: "https://docs.chroniclelabs.org/" },
      ],
    },
  },

  USDS: {
    "1:1 DAI migration": {
      audience: "user",
      rationale:
        "Use DaiUsds migration contract for 1:1 conversion — avoid thin pools for migration volume.",
      riskNotes:
        "Governance can alter migration contracts; pin addresses from official deployments.",
      links: [
        { label: "Sky docs", url: "https://docs.sky.money/" },
        {
          label: "USDS proxy (Etherscan)",
          url: "https://etherscan.io/address/0xdC035D45d973E3EC169d2276DDab16f1e407384F#code",
        },
      ],
    },
    "Sky Savings Rate — sUSDS": {
      audience: "user",
      standards: ["ERC-4626"],
      rationale:
        "SSR accrues in sUSDS shares — treat as ERC-4626 vault with protocol-specific risks.",
      riskNotes:
        "SSR changes; upgradeable USDS implementation interacts with savings layer.",
      links: [
        { label: "EIP-4626", url: EIP(4626) },
        { label: "Sky docs", url: "https://docs.sky.money/" },
      ],
    },
    "ERC1967Proxy upgradeable": {
      audience: "corporate",
      standards: ["EIP-1967"],
      rationale:
        "Token logic can change via proxy — monitor implementation slot and governance upgrades.",
      riskNotes:
        "Upgradeability increases governance/capture risk vs immutable DAI token.",
      links: [
        { label: "EIP-1967", url: EIP(1967) },
        { label: "MakerDAO GitHub", url: "https://github.com/makerdao" },
      ],
    },
    "Planned freeze function": {
      audience: "corporate",
      rationale:
        "Future freeze capability has been discussed for institutional compliance — track governance for activation.",
      riskNotes:
        "If activated, censorship assumptions for USDS diverge from historical DAI expectations.",
      links: [{ label: "Sky docs", url: "https://docs.sky.money/" }],
    },
    "Sky Token Rewards": {
      audience: "user",
      rationale:
        "Incentives for holding/migrating — relevant for wallet displays and staking integrations.",
      riskNotes:
        "Reward parameters change; smart contract risk in distributor contracts.",
      links: [{ label: "Sky.money", url: "https://sky.money/" }],
    },
    "Solana cross-chain": {
      audience: "both",
      standards: ["Wormhole OFT"],
      rationale:
        "Non-EVM deployment via Wormhole — Solana programs differ from EVM; use Wormhole tooling for addresses.",
      riskNotes:
        "Cross-chain messaging risk in addition to base stablecoin risk.",
      links: [
        { label: "Wormhole docs", url: "https://docs.wormhole.com/" },
      ],
    },
  },

  FDUSD: {
    "EIP-3009 gasless transfers on BSC": {
      audience: "user",
      standards: ["EIP-3009", "BEP-20"],
      rationale:
        "Gas sponsorship on BNB Chain via `transferWithAuthorization` — enables commerce-style flows similar to USDC.",
      riskNotes:
        "Relayer and nonce handling identical caveats to other EIP-3009 deployments.",
      links: [
        { label: "EIP-3009", url: EIP(3009) },
        {
          label: "FDUSD (BscScan)",
          url: "https://bscscan.com/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409#code",
        },
      ],
    },
    "Bankruptcy-remote trust structure": {
      audience: "corporate",
      rationale:
        "Legal ring-fencing for reserves — institutional due diligence, not on-chain enforceable.",
      riskNotes:
        "Legal regime and trust deed determine real protection; not visible in Solidity.",
      links: [{ label: "First Digital", url: "https://firstdigital.com/" }],
    },
    "Chainlink PoR oracle": {
      audience: "both",
      standards: ["Chainlink Data Feeds", "PoR"],
      rationale:
        "On-chain FDUSD/USD feed on BNB — contracts can anchor off-chain logic to oracle answers.",
      riskNotes:
        "Oracle downtime or deviation thresholds can block dependent protocols.",
      links: [
        { label: "Chainlink PoR", url: "https://docs.chain.link/data-feeds/proof-of-reserve" },
      ],
    },
    "Monthly attestations": {
      audience: "corporate",
      rationale:
        "Periodic attestations for reserve reporting — ops/compliance monitoring.",
      riskNotes:
        "Attestation lag vs real-time market; not on-chain proof.",
      links: [{ label: "First Digital", url: "https://firstdigital.com/" }],
    },
    "Issuer mint/burn/freeze": {
      audience: "corporate",
      standards: ["ERC-20 admin pattern"],
      rationale:
        "Centralized controls typical of fiat-backed issuers — same integration caveats as USDT/USDC.",
      riskNotes:
        "Blacklist/pause can strand positions in smart contracts holding FDUSD.",
      links: [
        {
          label: "FDUSD (Etherscan)",
          url: "https://etherscan.io/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409#code",
        },
      ],
    },
  },

  PYUSD: {
    "Solana Token-2022 extensions": {
      audience: "both",
      standards: ["SPL Token-2022"],
      rationale:
        "Solana program features differ from EVM — wallets and programs must explicitly support Token-2022.",
      riskNotes:
        "Not all Solana tooling supports extensions; silent failures possible.",
      links: [
        { label: "Solana Token-2022", url: "https://spl.solana.com/token-2022" },
      ],
    },
    "Confidential transfers": {
      audience: "corporate",
      rationale:
        "Privacy feature when enabled changes indexing and compliance visibility — monitor Paxos rollout.",
      riskNotes:
        "Compliance tooling may not see amounts; regulatory uncertainty for travel rule.",
      links: [{ label: "Paxos", url: "https://www.paxos.com/" }],
    },
    "Transfer hooks": {
      audience: "corporate",
      standards: ["Transfer Hook extension"],
      rationale:
        "Per-transfer program invocation enables allowlists and policy hooks — Solana integrators must account for compute and failure modes.",
      riskNotes:
        "Hook failure can block transfers; program upgrade risk.",
      links: [{ label: "Solana Token-2022", url: "https://spl.solana.com/token-2022" }],
    },
    "Memo field transfers": {
      audience: "user",
      rationale:
        "Attach structured metadata to transfers — useful for settlement references and reconciliation.",
      riskNotes:
        "Memo abuse or PII in memos can create compliance issues for indexers.",
      links: [{ label: "Solana Token-2022", url: "https://spl.solana.com/token-2022" }],
    },
    "Permanent delegate — Paxos": {
      audience: "corporate",
      rationale:
        "Delegate authority for regulatory freeze/seize on Solana — disclose to end users in custody products.",
      riskNotes:
        "Similar to centralized freeze on EVM Paxos tokens.",
      links: [
        { label: "PYUSD (PayPal)", url: "https://www.paypal.com/us/digital-wallet/pyusd" },
      ],
    },
    "LayerZero OFT burn-and-mint": {
      audience: "both",
      standards: ["LayerZero OFT"],
      rationale:
        "Cross-chain PYUSD uses burn/mint pattern — follow LayerZero peer configuration like other OFT assets.",
      riskNotes:
        "Bridge risk if peers mis-set; verify official OFT deployment addresses.",
      links: [{ label: "LayerZero docs", url: "https://docs.layerzero.network/" }],
    },
    "PayPal/Venmo unified balance": {
      audience: "user",
      rationale:
        "Custodial UX layer — on-chain balance may not reflect app balance; integrations should not assume 1:1 with PayPal ledger.",
      riskNotes:
        "Off-chain ledger and on-chain wraps can diverge during incidents.",
      links: [{ label: "PayPal PYUSD", url: "https://www.paypal.com/us/digital-wallet/pyusd" }],
    },
    "3.7% APY on PYUSD": {
      audience: "user",
      rationale:
        "Custodial yield product — not on-chain DeFi yield; terms set by PayPal, not smart contracts.",
      riskNotes:
        "Yield can change; not FDIC insured; counterparty to PayPal/Paxos stack.",
      links: [{ label: "PayPal PYUSD", url: "https://www.paypal.com/us/digital-wallet/pyusd" }],
    },
  },

  frxUSD: {
    "Permitted cash-equivalent reserves": {
      audience: "both",
      rationale:
        "frxUSD is 1:1 against Frax-approved cash-equivalent collateral, including tokenised Treasury funds (e.g. BUIDL, USTB, JTRSY, WTGXX, AUSD). The legacy fractional-algorithmic FRAX stablecoin model is retired.",
      riskNotes:
        "Reserve composition and mint eligibility are governance-defined — track Frax disclosures and on-chain mint contracts rather than assuming a single underlying fund.",
      links: [
        { label: "Frax frxUSD overview", url: "https://docs.frax.com/protocol/assets/frxusd/frxusd" },
        { label: "Frax GitHub", url: "https://github.com/FraxFinance" },
      ],
    },
    "sfrxUSD ERC-4626 vault": {
      audience: "user",
      standards: ["ERC-4626"],
      rationale:
        "Yield-bearing frxUSD via ERC-4626; returns reflect the vault’s benchmark yield strategy and reserve income, not a single static source.",
      riskNotes:
        "Verify sfrxUSD vault address from official Frax docs — old sFRAX contracts are not the same.",
      links: [
        { label: "EIP-4626", url: EIP(4626) },
        { label: "Frax GitHub", url: "https://github.com/FraxFinance" },
      ],
    },
    "Fraxlend isolated pairs": {
      audience: "user",
      rationale:
        "Isolated lending markets — each pair has unique oracle and liquidation params.",
      riskNotes:
        "Liquidation and interest rate spikes per pair; not a single global lending risk model.",
      links: [{ label: "Frax docs", url: "https://docs.frax.com" }],
    },
    "Fraxswap TWAMM": {
      audience: "user",
      rationale:
        "Native AMM with TWAMM order type — relevant for routing and MEV-aware trading integrations.",
      riskNotes:
        "AMM smart contract risk separate from frxUSD token contract.",
      links: [{ label: "Frax docs", url: "https://docs.frax.com" }],
    },
  },

  TUSD: {
    "Real-time on-chain attestation": {
      audience: "corporate",
      rationale:
        "Attestation cadence for transparency — useful for dashboards; verify what is actually attested on-chain vs marketing claims.",
      riskNotes:
        "Attestation provider or methodology changes can break monitoring assumptions.",
      links: [{ label: "TrueUSD", url: "https://tusd.io/" }],
    },
    "Chainlink Proof of Reserve": {
      audience: "both",
      standards: ["Chainlink PoR"],
      rationale:
        "PoR feeds let contracts condition logic on reserve data — integrate via Chainlink interfaces.",
      riskNotes:
        "Feed staleness and heartbeat matter for dependent protocols.",
      links: [
        { label: "Chainlink PoR", url: "https://docs.chain.link/data-feeds/proof-of-reserve" },
      ],
    },
    "Multi-bank escrow": {
      audience: "corporate",
      rationale:
        "Diversifies banking counterparty risk off-chain — legal structure matters for treasury users.",
      riskNotes:
        "Bank failure or access freezes still possible; not modeled on-chain.",
      links: [{ label: "TrueUSD", url: "https://tusd.io/" }],
    },
    "Asset protection freeze": {
      audience: "corporate",
      standards: ["ERC-20 admin"],
      rationale:
        "Issuer freeze function — same integration caveats as other regulated stables.",
      riskNotes:
        "User funds can become immovable without on-chain recourse.",
      links: [
        {
          label: "TUSD (Etherscan)",
          url: "https://etherscan.io/address/0x0000000000085d4780B73119b644AE5ecd22b376#code",
        },
      ],
    },
  },

  USD1: {
    "BitGo qualified custody": {
      audience: "corporate",
      rationale:
        "Reserves custodied with BitGo — institutional due diligence focus; on-chain token does not custody assets.",
      riskNotes:
        "Counterparty to custodian and issuer; early-stage disclosure may be limited.",
      links: [{ label: "BitGo", url: "https://www.bitgo.com/" }],
    },
    "Multi-chain from genesis": {
      audience: "both",
      rationale:
        "Verify **official** contract addresses per chain before integration — placeholders in static data are not authoritative.",
      riskNotes:
        "Wrong address integration is total loss; phishing and fake tokens are likely for high-profile launches.",
    },
    "Institutional partner focus": {
      audience: "corporate",
      rationale:
        "Distribution may skew to partner venues — on-chain liquidity depth may lag top stables.",
      riskNotes:
        "Concentration and listing risk; thin AMM liquidity on some chains.",
    },
    "Standard ERC-20/BEP-20 admin": {
      audience: "corporate",
      standards: ["ERC-20", "BEP-20"],
      rationale:
        "Typical centralized stable pattern — mint/burn/freeze; read verified source after addresses are confirmed.",
      riskNotes:
        "Admin key compromise is catastrophic; freeze risk for users.",
      links: [{ label: "EIP-20", url: ERC(20) }],
    },
  },
  GHO: {
    "Facilitator model — mint/burn": {
      audience: "both",
      standards: ["AccessControl (OZ)"],
      rationale:
        "Understand facilitator bucket caps before integration — available mint capacity is not unlimited. Query getFacilitatorBucket() to check remaining capacity.",
      riskNotes:
        "Governance can add/remove facilitators and adjust caps. A governance attack could dramatically expand supply.",
      links: [
        { label: "GHO docs", url: "https://docs.gho.xyz/" },
        {
          label: "GhoToken source (GitHub)",
          url: "https://github.com/aave/gho-core/blob/main/src/contracts/gho/GhoToken.sol",
        },
        {
          label: "Verified contract (Etherscan)",
          url: "https://etherscan.io/address/0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f#code",
        },
      ],
    },
    "EIP-2612 permit()": {
      audience: "user",
      standards: ["EIP-2612", "EIP-712"],
      rationale:
        "Standard permit for gasless approvals. Aave V3 offers supplyWithPermit/repayWithPermit that batch permit + pool action atomically.",
      riskNotes:
        "permit() returns void (Solmate pattern) — callers checking for bool return will break. No EIP-1271 support — smart contract wallets need Permit2.",
      links: [
        { label: "EIP-2612", url: EIP(2612) },
        {
          label: "ERC20 source (Solmate-derived)",
          url: "https://github.com/aave/gho-core/blob/main/src/contracts/gho/ERC20.sol",
        },
      ],
    },
    "ERC-3156 FlashMint facilitator": {
      audience: "user",
      standards: ["ERC-3156"],
      rationale:
        "Flash minting creates new GHO (not from liquidity pool) — limited by facilitator bucket capacity, not existing supply. Ideal for peg arbitrage and liquidations.",
      riskNotes:
        "Fee can be updated by pool admin — always check getFee() at execution time. Flash borrower must approve FlashMinter for repayment.",
      links: [
        { label: "ERC-3156 spec", url: ERC(3156) },
        {
          label: "GhoFlashMinter source",
          url: "https://github.com/aave/gho-core/blob/main/src/contracts/facilitators/flashMinter/GhoFlashMinter.sol",
        },
        {
          label: "GhoFlashMinter (Etherscan)",
          url: "https://etherscan.io/address/0xb639D208Bcf0589D54FaC24E655C79EC529762B8#code",
        },
      ],
    },
    "GHO Stability Module (GSM)": {
      audience: "both",
      standards: ["Custom (Aave)"],
      rationale:
        "Primary peg defence mechanism. 1:1 swaps between GHO and USDC/USDT with fee strategies and exposure caps — integrators can use GSM for peg arbitrage.",
      riskNotes:
        "GSM can be frozen by OracleSwapFreezer if exogenous token price deviates. Last Resort Liquidation can forcibly liquidate GSM holdings. Fee strategy changes affect arbitrage profitability.",
      links: [
        { label: "GSM docs", url: "https://docs.gho.xyz/" },
        {
          label: "GSM USDC (Etherscan)",
          url: "https://etherscan.io/address/0x3A3868898305f04beC7FEa77BecFf04C13444112",
        },
        {
          label: "GSM USDT (Etherscan)",
          url: "https://etherscan.io/address/0x882285E62656b9623AF136Ce3078c6BdCc33F5E3",
        },
      ],
    },
    "CCIP cross-chain bridging": {
      audience: "both",
      standards: ["Chainlink CCIP"],
      rationale:
        "Lock-and-mint from Ethereum, burn-and-mint between L2s. Uses Chainlink CCIP messaging — not a generic bridge interface. Rate-limited by governance-controlled CCIP parameters.",
      riskNotes:
        "CCIP bridge risk — Chainlink infrastructure dependency. Rate limits can cause delays during high-volume periods.",
      links: [
        { label: "GHO CCIP directory", url: "https://docs.chain.link/ccip/directory/mainnet/token/GHO" },
        {
          label: "GhoCCIPTokenPoolEthereum (Etherscan)",
          url: "https://etherscan.io/address/0x06179f7C1be40863405f374E7f5F8806c728660A",
        },
      ],
    },
    "stkGHO staking": {
      audience: "user",
      standards: ["Custom StakeToken (bgd-labs)"],
      rationale:
        "Staking GHO earns AAVE rewards and contributes to Aave safety module. Not ERC-4626 — uses custom stake/redeem/previewStake/previewRedeem interface with cooldown/unstake window.",
      riskNotes:
        "Cooldown period before unstaking. Exchange rate can change from slashing events. Not compatible with ERC-4626 aggregators.",
      links: [
        {
          label: "stkGHO proxy (Etherscan)",
          url: "https://etherscan.io/address/0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d",
        },
        {
          label: "StakeToken source (GitHub)",
          url: "https://github.com/bgd-labs/stake-token/blob/main/src/contracts/StakeToken.sol",
        },
      ],
    },
    "stkAAVE discount rate": {
      audience: "user",
      rationale:
        "stkAAVE holders get a discounted GHO borrow rate on Aave V3 — dual incentive for AAVE staking and GHO minting.",
      riskNotes:
        "Discount rate is governance-adjustable. Must be actively staking AAVE (stkAAVE) at time of borrow to receive discount.",
    },
    "Governance-controlled parameters": {
      audience: "corporate",
      standards: ["Aave Governance v3"],
      rationale:
        "All key parameters (borrow rate, facilitator caps, GSM fees, CCIP rate limits) are adjustable by governance. GHO Stewards (3-of-4 multisig) can make time-sensitive adjustments within pre-approved bounds.",
      riskNotes:
        "Governance attack vector: malicious proposals could dramatically change GHO economics. GHO Stewards add operational agility but introduce multisig trust assumptions.",
      links: [
        { label: "GHO Stewards source", url: "https://github.com/aave/gho-core/tree/main/src/contracts/misc" },
      ],
    },
  },
}
