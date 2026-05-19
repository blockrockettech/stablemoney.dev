/**
 * One-off script to validate and update proxy metadata in coins.ts.
 *
 * For each EVM deployment it reads two EIP-1967 storage slots:
 *   - Implementation: 0x360894...382bbc
 *   - Admin:          0xb53127...d6103
 * and the legacy ZeppelinOS pre-1967 implementation/admin slots.
 *
 * Detected proxy type is compared against the proxyType field in coins.ts
 * and any discrepancies are printed for manual review.
 *
 * Usage:
 *   tsx scripts/check-proxy-status.ts
 *   tsx scripts/check-proxy-status.ts --coin USDC
 *   tsx scripts/check-proxy-status.ts --coin USDC --chain ethereum
 */

import { coins } from "@/data/coins"
import type { NetworkDeployment } from "@/types"

// EIP-1967 standard storage slots
const SLOT_EIP1967_IMPL =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const SLOT_EIP1967_ADMIN =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
// ZeppelinOS / early OpenZeppelin unstructured storage slots
const SLOT_ZEPPELINOS_IMPL =
  "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3"
const SLOT_ZEPPELINOS_ADMIN =
  "0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b"

const CHAIN_RPCS: Record<string, string[]> = {
  ethereum: [
    "https://ethereum-rpc.publicnode.com",
    "https://rpc.ankr.com/eth",
    "https://eth.llamarpc.com",
    "https://cloudflare-eth.com",
    "https://1rpc.io/eth",
    "https://rpc.mevblocker.io",
    "https://api.securerpc.com/v1",
  ],
  arbitrum: ["https://rpc.ankr.com/arbitrum", "https://arb1.arbitrum.io/rpc", "https://1rpc.io/arb"],
  optimism: ["https://rpc.ankr.com/optimism", "https://mainnet.optimism.io", "https://1rpc.io/op"],
  base: ["https://rpc.ankr.com/base", "https://mainnet.base.org", "https://1rpc.io/base"],
  polygon: [
    "https://rpc.ankr.com/polygon",
    "https://polygon-rpc.com",
    "https://1rpc.io/matic",
    "https://polygon.llamarpc.com",
    "https://polygon.publicnode.com",
  ],
  avalanche: ["https://rpc.ankr.com/avalanche", "https://api.avax.network/ext/bc/C/rpc", "https://1rpc.io/avax/c"],
  bnb: ["https://bsc.publicnode.com", "https://rpc.ankr.com/bsc", "https://bsc-dataseed.binance.org", "https://1rpc.io/bnb"],
  zksync: ["https://mainnet.era.zksync.io", "https://1rpc.io/zksync2-era"],
  gnosis: ["https://rpc.ankr.com/gnosis", "https://rpc.gnosischain.com", "https://1rpc.io/gnosis"],
  mantle: ["https://rpc.mantle.xyz", "https://1rpc.io/mantle"],
}

// Non-EVM chains — skip silently
const NON_EVM_CHAINS = new Set([
  "solana",
  "tron",
  "bitcoin",
  "ton",
  "sui",
  "stellar",
  "aptos",
  "near",
  "hedera",
  "starknet",
  "xrp",
  "xrpl",
])

interface StorageResult {
  impl1967: string | null
  admin1967: string | null
  implZeppelinOS: string | null
  adminZeppelinOS: string | null
}

interface OnChainDetection {
  detectedType: "transparent" | "uups" | "custom" | "none" | "unknown"
  implAddress: string | null
  adminAddress: string | null
  slotFamily: "eip1967" | "zeppelinos" | "none"
}

type StaticProxyType = NonNullable<NetworkDeployment["proxyType"]>

function slotToAddress(value: string | null): string | null {
  if (!value || value === "0x" || value === "0x" + "0".repeat(64)) return null
  // EIP-1967 stores address in lowest 20 bytes
  return "0x" + value.slice(-40).toLowerCase()
}

async function getStorageAt(
  rpc: string,
  address: string,
  slot: string
): Promise<string | null> {
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getStorageAt",
        params: [address, slot, "latest"],
        id: 1,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: string; error?: unknown }
    if (json.error || typeof json.result !== "string") return null
    return json.result
  } catch {
    return null
  }
}

async function readProxySlotsFromRpc(
  rpc: string,
  address: string
): Promise<StorageResult> {
  const [impl1967, admin1967, implZeppelinOS, adminZeppelinOS] = await Promise.all([
    getStorageAt(rpc, address, SLOT_EIP1967_IMPL),
    getStorageAt(rpc, address, SLOT_EIP1967_ADMIN),
    getStorageAt(rpc, address, SLOT_ZEPPELINOS_IMPL),
    getStorageAt(rpc, address, SLOT_ZEPPELINOS_ADMIN),
  ])
  return { impl1967, admin1967, implZeppelinOS, adminZeppelinOS }
}

async function readProxySlots(
  rpcs: string[],
  address: string
): Promise<StorageResult & { rpcUsed?: string }> {
  for (const rpc of rpcs) {
    const result = await readProxySlotsFromRpc(rpc, address)
    // A valid response has at least one non-null slot
    if (
      result.impl1967 !== null ||
      result.admin1967 !== null ||
      result.implZeppelinOS !== null ||
      result.adminZeppelinOS !== null
    ) {
      return { ...result, rpcUsed: rpc }
    }
  }
  return {
    impl1967: null,
    admin1967: null,
    implZeppelinOS: null,
    adminZeppelinOS: null,
  }
}

function detect(slots: StorageResult): OnChainDetection {
  const impl1967 = slotToAddress(slots.impl1967)
  const admin1967 = slotToAddress(slots.admin1967)
  const implZeppelinOS = slotToAddress(slots.implZeppelinOS)
  const adminZeppelinOS = slotToAddress(slots.adminZeppelinOS)

  if (implZeppelinOS || adminZeppelinOS) {
    return {
      detectedType: "custom",
      implAddress: implZeppelinOS,
      adminAddress: adminZeppelinOS,
      slotFamily: "zeppelinos",
    }
  }

  const implAddr = impl1967
  const adminAddr = admin1967

  if (!implAddr) {
    return { detectedType: "none", implAddress: null, adminAddress: null, slotFamily: "none" }
  }

  // If admin slot is populated → transparent proxy pattern
  // If only impl slot is set → UUPS (upgrade logic lives in implementation)
  const detectedType: OnChainDetection["detectedType"] = adminAddr
    ? "transparent"
    : "uups"

  return { detectedType, implAddress: implAddr, adminAddress: adminAddr, slotFamily: "eip1967" }
}

function matchesStatic(
  detected: OnChainDetection["detectedType"],
  staticType: StaticProxyType | undefined
): boolean {
  if (!staticType) return detected === "none"
  if (staticType === "custom") return true
  return staticType === detected
}

const RESET = "\x1b[0m"
const GREEN = "\x1b[32m"
const YELLOW = "\x1b[33m"
const RED = "\x1b[31m"
const CYAN = "\x1b[36m"
const DIM = "\x1b[2m"

function ok(msg: string) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`)
}
function warn(msg: string) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`)
}
function fail(msg: string) {
  console.log(`  ${RED}✗${RESET} ${msg}`)
}
function info(msg: string) {
  console.log(`  ${DIM}${msg}${RESET}`)
}

// Parse CLI args
const args = process.argv.slice(2)
const coinFilter = args.includes("--coin")
  ? args[args.indexOf("--coin") + 1]?.toUpperCase()
  : null
const chainFilter = args.includes("--chain")
  ? args[args.indexOf("--chain") + 1]?.toLowerCase()
  : null

async function main() {
  console.log(`\n${CYAN}Proxy status check — stablemoney.dev${RESET}`)
  if (coinFilter) console.log(`  Filtering to coin: ${coinFilter}`)
  if (chainFilter) console.log(`  Filtering to chain: ${chainFilter}`)
  console.log()

  let checked = 0
  let mismatches = 0
  let skipped = 0
  let errors = 0

  for (const coin of coins) {
    if (coinFilter && coin.symbol !== coinFilter) continue

    const evmNets = coin.networks.filter((n) => {
      if (NON_EVM_CHAINS.has(n.chain)) return false
      if (chainFilter && n.chain !== chainFilter) return false
      if (!CHAIN_RPCS[n.chain]?.length) return false
      // Basic EVM address sanity check
      if (!n.contract.startsWith("0x") || n.contract.length !== 42) return false
      return true
    })

    if (evmNets.length === 0) continue

    console.log(`${CYAN}${coin.symbol}${RESET} — ${coin.name}`)

    for (const net of evmNets) {
      process.stdout.write(
        `  ${net.name} (${net.chain}) ${net.contract.slice(0, 10)}…  `
      )

      const slots = await readProxySlots(CHAIN_RPCS[net.chain], net.contract)
      const detection = detect(slots)

      checked++

      const matches = matchesStatic(detection.detectedType, net.proxyType)
      process.stdout.write("\n")

      if (slots.impl1967 === null && slots.implZeppelinOS === null) {
        errors++
        fail(`RPC error or no response — skipping`)
        continue
      }

      if (matches) {
        ok(
          `${detection.detectedType} (${detection.slotFamily}) — matches static proxyType: "${net.proxyType ?? "none"}"`
        )
      } else {
        mismatches++
        fail(
          `Mismatch — on-chain: "${detection.detectedType}" (${detection.slotFamily}), static: "${net.proxyType ?? "(unset)"}"`
        )
      }

      if (detection.implAddress) {
        const implLabel = net.implementation
          ? detection.implAddress === net.implementation.toLowerCase()
            ? `✓ matches static`
            : `⚠ differs from static (${net.implementation})`
          : `(not in static data)`
        info(`  impl:  ${detection.implAddress}  ${implLabel}`)
      }

      if (detection.adminAddress) {
        const adminLabel = net.proxyAdmin
          ? detection.adminAddress === net.proxyAdmin.toLowerCase()
            ? `✓ matches static`
            : `⚠ differs from static (${net.proxyAdmin})`
          : `(no static proxyAdmin recorded)`
        info(`  admin: ${detection.adminAddress}  ${adminLabel}`)
      }

      if (!net.proxyType && detection.detectedType !== "none") {
        warn(
          `  Suggest adding to coins.ts:  proxyType: "${detection.detectedType}"`
        )
        if (detection.implAddress) {
          warn(`  Suggest adding:              implementation: "${detection.implAddress}"`)
        }
        if (detection.adminAddress && detection.detectedType === "transparent") {
          warn(`  Suggest adding:              proxyAdmin: "${detection.adminAddress}"`)
        }
      }
    }

    console.log()
  }

  console.log(
    `${CYAN}Summary:${RESET} ${checked} checked, ${mismatches} mismatches, ${skipped} skipped (custom), ${errors} RPC errors`
  )

  if (mismatches > 0) {
    console.log(
      `\n${YELLOW}Action required:${RESET} Review mismatches above and update coins.ts proxyType fields.`
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
