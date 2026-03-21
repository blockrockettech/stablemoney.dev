import type { CoinEipProfile } from "@/types/eip"

export const COIN_EIP_PROFILES: CoinEipProfile[] = [
  {
    symbol: "USDC",
    contractName: "FiatToken v2.2",
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
          "Standard ERC-20. approve() requires allowance to be set to zero before changing to non-zero (double-spend guard). Transfer and approve are blocked for blacklisted addresses. The transfer() function checks both sender and receiver against the blacklist mapping.",
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
    ],
  },

  {
    symbol: "USDT",
    contractName: "TetherToken",
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
          "Written in Solidity 0.4.x. Deviates from ERC-20 spec in two critical ways: (1) approve() race condition guard — requires allowance be set to 0 before setting a non-zero value; (2) contains onlyPayloadSize modifier for short-address attack defence (obsolete on modern tooling). Contains a fee-on-transfer mechanism (basisPointsRate, maximumFee) currently set to 0 but activatable by owner.",
        devImpact:
          "Most liquid stablecoin but worst DeFi UX due to non-standard approve(). Every approve() call in a standard ERC-20 integration requires a two-step zero-first pattern for USDT, or the transaction reverts silently.",
        footguns:
          "THREE major footguns: (1) approve() will revert if allowance is non-zero — always call approve(spender, 0) first. (2) fee-on-transfer mechanism exists but is dormant — use balanceBefore/balanceAfter pattern for any safeTransfer. (3) destroyBlackFunds can reduce totalSupply without a Burn event — supply tracking tools must account for this.",
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
    ],
  },

  {
    symbol: "DAI",
    contractName: "dai.sol (MCD)",
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
    ],
  },

  {
    symbol: "USDS",
    contractName: "USDS + sUSDS (Sky Protocol)",
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
          "Asset = USDS, share = sUSDS. Exchange rate (USDS per sUSDS) accrues via an internal accumulator (chi) updated by the drip() function, similar to DAI DSR pot.sol. convertToAssets() gives real-time value even if drip() has not been called recently. No lockup — instant deposit and redemption. Emits both ERC-20 Transfer and ERC-4626 Deposit/Withdraw events.",
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
    ],
  },

  {
    symbol: "USDe",
    contractName: "USDe.sol + StakedUSDe.sol (Ethena Labs)",
    isUpgradeable: true,
    upgradePattern:
      "Upgradeable proxy stack (OpenZeppelin-style) — confirm implementation + admin roles on Etherscan",
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
          "Two distinct EIP-712 surfaces: (1) USDe token uses a standard ERC-20 permit domain for approvals; (2) mint/redeem uses EIP-712 structured orders verified inside EthenaMinting.sol (not the same as token transfer authorizations). Relayers submit signed orders atomically with collateral movements.",
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
        status: "implemented",
        contractPattern: "Proxy + implementation split (verify slot on explorer)",
        keyFunctions: [
          "Admin / upgrade entrypoints on proxy — role-gated (see implementation ABI)",
        ],
        implementationNotes:
          "Ethena deploys upgradeable infrastructure so risk parameters and logic can change via governance/ops. Standard EIP-1967 slots are typical for OpenZeppelin Transparent/UUPS variants — confirm on Etherscan “Read as Proxy”.",
        devImpact:
          "Integrators must pin the proxy address and monitor implementation changes in audit releases.",
        footguns:
          "Calling the implementation address directly bypasses token state — same proxy footgun as USDC.",
      },
      {
        eipId: "EIP-1822",
        status: "unknown",
        contractPattern: "May apply to some auxiliary contracts — verify per deployment",
        keyFunctions: [],
        implementationNotes:
          "If any Ethena contract uses UUPS, upgrade auth lives in implementation code. Not assumed for USDe without on-chain verification.",
        devImpact:
          "UUPS vs transparent proxy changes who can brick upgrades — verify before forking.",
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
          "sUSDe is the yield-bearing share token over USDe with ERC-4626-style deposit/redeem. Ethena adds cooldown/restricted unstake mechanics — interface matches ERC-4626 but timing and maxWithdraw behavior reflect protocol policy.",
        devImpact:
          "ERC-4626-aware aggregators can price and route sUSDe like other vault shares; account for cooldown when quoting user exits.",
        footguns:
          "Cooldown means instant full liquidity assumptions fail — read previewRedeem and staking rules before building withdrawal UX.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not standard on USDe token",
        keyFunctions: [],
        implementationNotes:
          "No broad EIP-1271 helper on USDe comparable to Sky’s USDS deployment — smart-wallet permit flows may require alternate patterns.",
        devImpact:
          "Contract wallets may need middleware or EOAs for permit signing unless future upgrades add validation hooks.",
      },
    ],
  },

  {
    symbol: "FDUSD",
    contractName: "First Digital USD (EVM deployment)",
    isUpgradeable: true,
    upgradePattern: "Issuer-controlled upgrade path — verify proxy type on Etherscan / official docs",
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
        status: "partial",
        contractPattern: "Present when EIP-3009 is enabled (typed authorizations)",
        keyFunctions: ["DOMAIN_SEPARATOR() → bytes32 — call on target chain deployment"],
        implementationNotes:
          "EIP-3009 depends on EIP-712 structured data. If your target chain’s FDUSD implementation includes transferWithAuthorization, DOMAIN_SEPARATOR must be queried from that contract.",
        devImpact:
          "Required to build relayer-signed payment flows wherever EIP-3009 is live.",
      },
      {
        eipId: "EIP-2612",
        status: "unknown",
        contractPattern: "Unconfirmed on Ethereum mainnet deployment",
        keyFunctions: [],
        implementationNotes:
          "First Digital documentation highlights EIP-3009-style gasless flows on BNB Chain; permit() may or may not ship alongside — verify with eth_call to nonces(address) and permit on the bytecode you use.",
        devImpact:
          "If permit is absent, DeFi UX falls back to classic approve or Permit2.",
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
        status: "unknown",
        contractPattern: "Possible proxy — confirm storage slots",
        keyFunctions: [],
        implementationNotes:
          "Issuer tokens often use proxies; exact pattern (transparent vs UUPS) should be read from explorer “Contract” tab.",
        devImpact:
          "Proxy detection drives correct ABI attachment in indexers and wallets.",
      },
      {
        eipId: "EIP-1822",
        status: "unknown",
        contractPattern: "Unconfirmed",
        keyFunctions: [],
        implementationNotes: "Verify implementation contract inheritance on Etherscan.",
        devImpact: "Affects how upgrade safety is reasoned about in audits.",
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
    ],
  },

  {
    symbol: "PYUSD",
    contractName: "PayPal USD — Paxos FiatToken derivative (Ethereum)",
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
        status: "implemented",
        contractPattern: "Upgradeable proxy (confirm via explorer storage)",
        keyFunctions: [
          "Implementation slot readable via standard tooling — upgrade gated by delayed admin",
        ],
        implementationNotes:
          "Uses OpenZeppelin AccessControl default admin delay pattern in public ABI; implementation address follows common proxy slot conventions — always read proxy storage, not guesses.",
        devImpact:
          "Explorers and Tenderly can attach the correct implementation ABI when slots are standard.",
      },
      {
        eipId: "EIP-1822",
        status: "unknown",
        contractPattern: "May be transparent proxy rather than UUPS — verify",
        keyFunctions: [],
        implementationNotes:
          "Paxos historically shipped transparent-upgradeable patterns; confirm for PYUSD specifically.",
        devImpact: "Minor gas and audit surface differences for forks.",
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
    ],
  },

  {
    symbol: "FRAX",
    contractName: "FRAX (Frax Finance) + sFRAX vault",
    isUpgradeable: true,
    upgradePattern: "TransparentUpgradeableProxy (canonical FRAX token)",
    implementations: [
      {
        eipId: "ERC-20",
        status: "implemented",
        contractPattern: "FRAX ERC-20 with pool-controlled mint/burn",
        keyFunctions: [
          "transfer / transferFrom / approve → bool",
          "balanceOf / allowance / totalSupply",
          "pool_mint(address pool, uint256 amount) — controller",
          "pool_burn_from(address pool, address account, uint256 amount) — controller",
        ],
        implementationNotes:
          "Algorithmic / fractional-reserve mechanics: supply changes through FraxPool and AMO minters, not public mint(). Standard transfer semantics for secondary markets.",
        devImpact:
          "DEX and lending treat FRAX as ERC-20; supply shocks follow collateral ratio and AMO policy.",
        footguns:
          "Integrations must use the proxy address on each chain — implementation upgrades have occurred historically.",
      },
      {
        eipId: "EIP-712",
        status: "not-implemented",
        contractPattern: "Not on FRAX token",
        keyFunctions: [],
        implementationNotes:
          "FRAX itself does not expose a token-level EIP-712 domain for transfers; governance and peripheral contracts may use signatures separately.",
        devImpact: "No native typed-data signing surface on the FRAX ERC-20.",
      },
      {
        eipId: "EIP-2612",
        status: "not-implemented",
        contractPattern: "No permit() on canonical FRAX",
        keyFunctions: [],
        implementationNotes:
          "Unlike Circle/Paxos fiat tokens, FRAX omits permit — use approve + action or Permit2.",
        devImpact:
          "Gasless approval flows require Permit2 or bespoke meta-tx wrappers.",
      },
      {
        eipId: "EIP-3009",
        status: "not-implemented",
        contractPattern: "No transferWithAuthorization",
        keyFunctions: [],
        implementationNotes: "No EIP-3009 authorization map on FRAX.",
        devImpact: "Payment relayers cannot use USDC-style authorizations on FRAX directly.",
      },
      {
        eipId: "EIP-1967",
        status: "implemented",
        contractPattern: "TransparentUpgradeableProxy (per Frax technical notes)",
        keyFunctions: [
          "upgradeTo / admin — role-gated on proxy admin contract",
        ],
        implementationNotes:
          "FRAX uses upgradeable proxies so monetary policy logic can evolve. Track governance votes for implementation pointer changes.",
        devImpact:
          "Correct ABI attachment depends on reading proxy → implementation relationship per chain.",
        footguns:
          "AMO and pool contracts also upgrade — integrators focused only on the token may miss downstream behavior changes.",
      },
      {
        eipId: "EIP-1822",
        status: "not-implemented",
        contractPattern: "FRAX uses transparent proxy stack, not canonical UUPS for the token",
        keyFunctions: [],
        implementationNotes: "sFRAX or other satellites may differ — verify individually.",
        devImpact: "Low for typical FRAX holders.",
      },
      {
        eipId: "ERC-4626",
        status: "implemented",
        contractPattern: "sFRAX — ERC-4626 vault over FRAX yield strategy",
        keyFunctions: [
          "deposit(uint256 assets, address receiver) → uint256 shares",
          "mint / withdraw / redeem",
          "convertToShares / convertToAssets / preview*",
          "asset() → address (FRAX)",
        ],
        implementationNotes:
          "Staked FRAX exposes ERC-4626 for protocol yield routing (AMO / RWA revenues). Use official Frax docs for current vault address per chain.",
        devImpact:
          "Composable with ERC-4626 routers, aggregators, and money markets that auto-detect the interface.",
        footguns:
          "Yield and pause parameters are governance-controlled — read preview functions at transaction time.",
      },
      {
        eipId: "EIP-1271",
        status: "not-implemented",
        contractPattern: "Not on FRAX token",
        keyFunctions: [],
        implementationNotes: "No token-level isValidSignature.",
        devImpact: "Smart wallets follow standard ERC-20 approval paths.",
      },
    ],
  },

  {
    symbol: "TUSD",
    contractName: "TrueUSD — TokenController proxy + delegate",
    isUpgradeable: true,
    upgradePattern: "Controller → implementation delegate (legacy Archblock / TrustToken pattern)",
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
          "Older fiat-token architecture than Circle v2.2: uses delegatecall-style upgrades via controller. Historical TrueReward feature complicated balance views — confirm current deployment has rewards disabled for integrators expecting simple balances.",
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
    ],
  },

  {
    symbol: "USD1",
    contractName: "USD1 (WLFI — early stage)",
    isUpgradeable: true,
    upgradePattern: "Likely ERC1967Proxy — unconfirmed, verify on Etherscan",
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
        status: "unknown",
        contractPattern: "Unconfirmed",
        keyFunctions: [],
        implementationNotes:
          "Not confirmed at time of research. If USD1 uses OpenZeppelin ERC20 v4+ or v5 as a base, EIP-712 would be included automatically. Verify by calling DOMAIN_SEPARATOR() on the deployed contract.",
        devImpact:
          "Required for any signature-based flow. Check before building relayer or gasless payment infrastructure on top of USD1.",
      },
      {
        eipId: "EIP-2612",
        status: "unknown",
        contractPattern: "Unconfirmed",
        keyFunctions: [],
        implementationNotes:
          "Not confirmed publicly. If using OpenZeppelin ERC20Permit base, EIP-2612 is present. Verify by calling nonces(address) on the deployed contract — if it returns without error, the function exists.",
        devImpact:
          "Critical gap for DeFi integration if absent. USD1 must add EIP-2612 to compete with USDC for developer adoption.",
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
    ],
  },
]
