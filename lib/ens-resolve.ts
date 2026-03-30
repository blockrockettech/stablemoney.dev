/**
 * ENS name resolution via eth_call.
 *
 * Resolution flow:
 *   1. namehash(name)                → node (bytes32)   [EIP-137]
 *   2. ENS Registry.resolver(node)   → resolverAddress
 *   3. resolverAddress.addr(node)    → ethereum address
 *
 * Uses @noble/hashes for keccak256 (zero transitive deps, 3.5 KB gzipped)
 * and the same jsonRpcEthCall infrastructure as the compliance checks.
 */

import { keccak_256 } from "@noble/hashes/sha3.js"
import { jsonRpcEthCall } from "@/lib/evm-json-rpc"

// ── EIP-137 namehash ─────────────────────────────────────────────────────────

const enc = new TextEncoder()

function namehash(name: string): string {
  let node = new Uint8Array(32) // zero bytes32 = root node
  if (name) {
    for (const label of name.split(".").reverse()) {
      const combined = new Uint8Array(64)
      combined.set(node, 0)
      combined.set(keccak_256(enc.encode(label)), 32)
      node = new Uint8Array(keccak_256(combined)) // copy to ArrayBuffer-backed Uint8Array
    }
  }
  return Array.from(node, (b) => b.toString(16).padStart(2, "0")).join("")
}

// ── ENS resolution via eth_call ───────────────────────────────────────────────

// Ethereum mainnet ENS Registry (deployed 2019, immutable)
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
const SEL_RESOLVER = "0x0178b8bf" // resolver(bytes32) → address
const SEL_ADDR = "0x3b3b57de" // addr(bytes32)     → address

export interface EnsResolveResult {
  /** Resolved Ethereum address, or null on failure */
  address: string | null
  error?: string
}

/**
 * Resolve an ENS name (e.g. "vitalik.eth") to an Ethereum address.
 *
 * @param name    ENS name in any case — will be lowercased
 * @param rpcUrl  Ethereum mainnet JSON-RPC endpoint
 */
export async function resolveEnsName(
  name: string,
  rpcUrl: string
): Promise<EnsResolveResult> {
  const lower = name.toLowerCase().trim()
  const node = namehash(lower)

  // Step 1 — get the resolver from the ENS registry
  const { result: resolverRaw, errorMessage: resolverErr } = await jsonRpcEthCall(
    rpcUrl,
    ENS_REGISTRY,
    `${SEL_RESOLVER}${node}`
  )
  if (resolverErr) return { address: null, error: `Registry: ${resolverErr}` }
  if (!resolverRaw || resolverRaw === "0x")
    return { address: null, error: "Name not found in ENS registry" }

  const resolverAddr = "0x" + resolverRaw.slice(-40)
  if (/^0x0+$/.test(resolverAddr))
    return { address: null, error: "ENS name is not registered" }

  // Step 2 — call addr(node) on the resolver
  const { result: addrRaw, errorMessage: addrErr } = await jsonRpcEthCall(
    rpcUrl,
    resolverAddr,
    `${SEL_ADDR}${node}`
  )
  if (addrErr) return { address: null, error: `Resolver: ${addrErr}` }
  if (!addrRaw || addrRaw === "0x") {
    return { address: null, error: "Resolver returned no address" }
  }

  const address = "0x" + addrRaw.slice(-40)
  if (/^0x0+$/.test(address)) {
    return { address: null, error: "ENS name has no Ethereum address set" }
  }
  return { address: address }
}

/** True when the input looks like an ENS name rather than a raw hex address. */
export function isEnsName(input: string): boolean {
  const t = input.trim()
  return t.includes(".") && !t.startsWith("0x")
}
