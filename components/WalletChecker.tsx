"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Link2,
  Loader2,
  Minus,
  Search,
  ShieldAlert,
  ShieldOff,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/CopyButton"
import { cn } from "@/lib/utils"
import {
  COMPLIANCE_CONFIG,
  EVM_RPC_URLS,
  SELECTORS,
  type CoinComplianceConfig,
  type EvmChainConfig,
  type TronChainConfig,
  type SolanaChainConfig,
  type XrplChainConfig,
} from "@/data/compliance"
import { coinBySymbol } from "@/data/coins"
import {
  decodeBool,
  decodeUint256,
  encodeCall,
  jsonRpcEthCall,
} from "@/lib/crypto/evm-json-rpc"
import {
  evmToTronHex,
  encodeTronAddressParam,
  tronTriggerConstantContract,
} from "@/lib/crypto/tron-rpc"
import { getSolanaTokenFreezeStatus, isValidSolanaAddress } from "@/lib/crypto/solana-rpc"
import { getXrplTrustlineFreezeStatus, isValidXrplAddress } from "@/lib/crypto/xrpl-rpc"
import { resolveEnsName, isEnsName } from "@/lib/crypto/ens-resolve"
import { getWalletCheckSummary } from "@/lib/crypto/wallet-check-summary"

// ── Types ─────────────────────────────────────────────────────────────────────

export type CheckStatus =
  | "clear"
  | "blacklisted"
  | "frozen"
  | "flagged-with-balance"   // blacklisted/frozen AND non-zero balance — seizure risk
  | "pending-abi"
  | "coming-soon"
  | "no-controls"
  | "not-checked"            // address for this network was not provided in the current run
  | "error"

export interface ChainResult {
  coinSymbol: string
  coinName: string
  issuer: string
  chainName: string
  chain: string
  contract: string
  explorerUrl: string | null
  status: CheckStatus
  /** Frozen/blacklisted balance in raw token units (before decimals) */
  balance?: bigint
  /** Function that returned the flag */
  fnName?: string
  selector?: string
  rpcUrl?: string
  errorMessage?: string
  notes?: string
  seizureNote?: string
}

// ── Rate-limit config ─────────────────────────────────────────────────────────
// Minimum ms between successive eth_calls to the same RPC endpoint.
// Increase if you're hitting 429s; decrease for paid/private RPCs.
const RPC_STAGGER_MS = 2000

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Table / summary placeholder for N/A cells */
const UI_EM_DASH = "—"

const INVALID_WALLET_MESSAGE =
  "Enter a valid EVM address (0x followed by 40 hex characters)."
const INVALID_SOLANA_MESSAGE =
  "Enter a valid Solana address (base58, 32–44 characters) or leave blank."
const INVALID_XRPL_MESSAGE =
  "Enter a valid XRPL address (starts with r, 25–35 characters) or leave blank."

const RPC_UNEXPECTED_RESPONSE =
  "RPC call returned null or unexpected response. CORS or rate-limit issue."

const SOLANA_INPUT_PLACEHOLDER = "Base58 Solana address (optional)"
const XRPL_INPUT_PLACEHOLDER = "r… XRP Ledger address (optional)"

const explorerIconLinkProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer" as const,
  className: "text-primary shrink-0",
  title: "View on explorer",
}

const STATUS_LEGEND: ReadonlyArray<{ status: CheckStatus; description: string }> = [
  {
    status: "blacklisted",
    description: "Address is on the issuer blacklist — all transfers revert.",
  },
  {
    status: "frozen",
    description: "Address is frozen — sends blocked, may still receive.",
  },
  {
    status: "flagged-with-balance",
    description:
      "Flagged AND non-zero balance — issuer may be able to seize or destroy funds.",
  },
  {
    status: "pending-abi",
    description:
      "EVM contract exists but the exact compliance function needs ABI verification before going live.",
  },
  {
    status: "coming-soon",
    description:
      "Check not yet live for this chain. For Solana or XRPL rows, provide the optional address above to enable the check.",
  },
  {
    status: "no-controls",
    description:
      "No freeze or blacklist capability on this token contract — transfers are fully permissionless.",
  },
]

const devDetailsPanelClass =
  "border-t border-border/60 bg-muted/20 px-3 py-3 text-xs"

const summaryBannerTone = {
  clear:      "border-green-800/60 bg-green-950/30",
  flagged:    "border-red-800/60 bg-red-950/30",
  incomplete: "border-yellow-800/60 bg-yellow-950/20",
} as const

const resultsRowTone = {
  flagged: "bg-red-950/30",
  clearLive: "bg-green-950/10",
  expanded: "bg-muted/20",
} as const

function devDetailsPanelDomId(rowKey: string): string {
  return `wallet-dev-${rowKey.replace(/[^a-zA-Z0-9_-]+/g, "-")}`
}

// ── ERC-55 checksum (basic) ────────────────────────────────────────────────────

function isValidEthAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

function complianceLabels(c: CoinComplianceConfig) {
  const row = coinBySymbol[c.symbol.toUpperCase()]
  return { coinName: row?.name ?? c.symbol, issuer: row?.issuer ?? "" }
}

// ── Core check runner ─────────────────────────────────────────────────────────

async function runEvmCheck(
  coin: CoinComplianceConfig,
  chain: EvmChainConfig,
  walletAddress: string,
): Promise<ChainResult> {
  const { coinName, issuer } = complianceLabels(coin)
  const base: Omit<ChainResult, "status" | "fnName" | "selector" | "balance" | "errorMessage"> = {
    coinSymbol: coin.symbol,
    coinName,
    issuer,
    chainName: chain.chainName,
    chain: chain.chain,
    contract: chain.contract,
    explorerUrl: chain.explorerUrl,
    rpcUrl: chain.rpcUrl,
    notes: chain.notes,
    seizureNote: coin.seizureNote,
  }

  for (const check of chain.checks) {
    const { result: raw, errorMessage: rpcErr } = await jsonRpcEthCall(
      chain.rpcUrl,
      chain.contract,
      encodeCall(check.selector, walletAddress),
    )
    const flagged = decodeBool(raw)

    if (flagged === null) {
      return {
        ...base,
        status: "error",

        fnName: check.fnName,
        selector: check.selector,
        errorMessage: rpcErr ? `${rpcErr} — ${RPC_UNEXPECTED_RESPONSE}` : RPC_UNEXPECTED_RESPONSE,
      }
    }

    if (flagged) {
      // balanceOf counts as an extra call — no stagger needed here as it's only
      // triggered on a positive flag (rare path) and follows naturally.
      const balCall = await jsonRpcEthCall(
        chain.rpcUrl,
        chain.contract,
        encodeCall(SELECTORS.balanceOf, walletAddress),
      )
      const balance = decodeUint256(balCall.result) ?? undefined
      const hasBalance = balance !== undefined && balance > BigInt(0)
      const balanceNote =
        balCall.errorMessage && !hasBalance
          ? `Balance check inconclusive: ${balCall.errorMessage}`
          : undefined

      return {
        ...base,
        status: hasBalance ? "flagged-with-balance" : check.type === "blacklist" ? "blacklisted" : "frozen",
        balance,
        notes: balanceNote ? [base.notes, balanceNote].filter(Boolean).join(" · ") : base.notes,

        fnName: check.fnName,
        selector: check.selector,
      }
    }
  }

  return {
    ...base,
    status: "clear",
    fnName: chain.checks[0]?.fnName,
    selector: chain.checks[0]?.selector,
  }
}

// ── TRON check runner ─────────────────────────────────────────────────────────

async function runTronCheck(
  coin: CoinComplianceConfig,
  chain: TronChainConfig,
  evmAddress: string,
): Promise<ChainResult> {
  const { coinName, issuer } = complianceLabels(coin)
  const base: Omit<ChainResult, "status" | "balance" | "errorMessage"> = {
    coinSymbol: coin.symbol,
    coinName,
    issuer,
    chainName: chain.chainName,
    chain: chain.chain,
    contract: chain.contract,
    explorerUrl: chain.explorerUrl,
    rpcUrl: chain.apiUrl,
    fnName: chain.fnName,
    selector: chain.selector,
    notes: chain.notes,
    seizureNote: coin.seizureNote,
  }

  const ownerHex = evmToTronHex(evmAddress)
  const parameter = encodeTronAddressParam(evmAddress)

  const { result, errorMessage } = await tronTriggerConstantContract(
    chain.apiUrl,
    chain.contract,
    chain.fnSelector,
    parameter,
    ownerHex,
  )

  // TRON returns hex without "0x" — prefix it so decodeBool works correctly
  const flagged = decodeBool(result !== null ? `0x${result}` : null)

  if (flagged === null) {
    return {
      ...base,
      status: "error",
      errorMessage: errorMessage
        ? `${errorMessage} — TronGrid API issue.`
        : "TronGrid returned null or unexpected response. Check CORS or rate limit.",
    }
  }

  if (flagged) {
    // Balance check — same ABI as EVM (TRON uses identical encoding)
    const { result: balRaw } = await tronTriggerConstantContract(
      chain.apiUrl,
      chain.contract,
      "balanceOf(address)",
      parameter,
      ownerHex,
    )
    const balance = decodeUint256(balRaw !== null ? `0x${balRaw}` : null) ?? undefined
    const hasBalance = balance !== undefined && balance > BigInt(0)

    return {
      ...base,
      status: hasBalance ? "flagged-with-balance" : chain.checkType === "blacklist" ? "blacklisted" : "frozen",
      balance,
    }
  }

  return { ...base, status: "clear" }
}

// ── Solana check runner ───────────────────────────────────────────────────────

async function runSolanaCheck(
  coin: CoinComplianceConfig,
  chain: SolanaChainConfig,
  solanaAddress: string,
): Promise<ChainResult> {
  const { coinName, issuer } = complianceLabels(coin)
  const base: Omit<ChainResult, "status" | "balance" | "errorMessage"> = {
    coinSymbol: coin.symbol,
    coinName,
    issuer,
    chainName: chain.chainName,
    chain: chain.chain,
    contract: chain.contract,
    explorerUrl: chain.explorerUrl,
    rpcUrl: chain.rpcUrl,
    fnName: "getTokenAccountsByOwner",
    notes: chain.notes,
    seizureNote: coin.seizureNote,
  }

  const { frozen, balance, errorMessage } = await getSolanaTokenFreezeStatus(
    chain.rpcUrl,
    chain.contract,
    solanaAddress,
    chain.programId,
  )

  if (errorMessage) {
    return { ...base, status: "error", errorMessage }
  }

  if (frozen) {
    const hasBalance = balance > BigInt(0)
    return {
      ...base,
      status: hasBalance ? "flagged-with-balance" : "frozen",
      balance,
    }
  }

  return { ...base, status: "clear", balance }
}

// ── XRPL check runner ─────────────────────────────────────────────────────────

async function runXrplCheck(
  coin: CoinComplianceConfig,
  chain: XrplChainConfig,
  xrplAddress: string,
): Promise<ChainResult> {
  const { coinName, issuer } = complianceLabels(coin)
  const base: Omit<ChainResult, "status" | "balance" | "errorMessage"> = {
    coinSymbol: coin.symbol,
    coinName,
    issuer,
    chainName: chain.chainName,
    chain: chain.chain,
    contract: chain.contract,
    explorerUrl: chain.explorerUrl,
    rpcUrl: chain.apiUrl,
    fnName: "account_lines (freeze_peer)",
    notes: chain.notes,
    seizureNote: coin.seizureNote,
  }

  const { frozen, balance, errorMessage } = await getXrplTrustlineFreezeStatus(
    chain.apiUrl,
    xrplAddress,
    chain.currency,
    chain.issuer,
  )

  if (errorMessage) {
    return { ...base, status: "error", errorMessage }
  }

  if (frozen) {
    const balFloat = parseFloat(balance)
    const hasBalance = !isNaN(balFloat) && balFloat > 0
    // Convert XRPL decimal balance to bigint (6 decimal places for RLUSD)
    const balanceBigint = hasBalance ? BigInt(Math.round(balFloat * 1_000_000)) : undefined
    return {
      ...base,
      status: hasBalance ? "flagged-with-balance" : "frozen",
      balance: balanceBigint,
    }
  }

  return { ...base, status: "clear" }
}

// ── Staggered RPC group runners ───────────────────────────────────────────────
// Groups all checks by endpoint URL so each provider is queried at most once
// every RPC_STAGGER_MS. Different providers run fully in parallel.

async function runEvmGroup(
  tasks: Array<{ coin: CoinComplianceConfig; chain: EvmChainConfig }>,
  walletAddress: string,
  onProgress: () => void,
): Promise<ChainResult[]> {
  const results: ChainResult[] = []
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0) await sleep(RPC_STAGGER_MS)
    try {
      results.push(await runEvmCheck(tasks[i].coin, tasks[i].chain, walletAddress))
    } catch (err) {
      const { coin, chain } = tasks[i]
      const { coinName, issuer } = complianceLabels(coin)
      results.push({
        coinSymbol: coin.symbol,
        coinName,
        issuer,
        chainName: chain.chainName,
        chain: chain.chain,
        contract: chain.contract,
        explorerUrl: chain.explorerUrl,
        rpcUrl: chain.rpcUrl,
        status: "error",
        errorMessage: String(err),
      })
    }
    onProgress()
  }
  return results
}

async function runTronGroup(
  tasks: Array<{ coin: CoinComplianceConfig; chain: TronChainConfig }>,
  evmAddress: string,
  onProgress: () => void,
): Promise<ChainResult[]> {
  const results: ChainResult[] = []
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0) await sleep(RPC_STAGGER_MS)
    try {
      results.push(await runTronCheck(tasks[i].coin, tasks[i].chain, evmAddress))
    } catch (err) {
      const { coin, chain } = tasks[i]
      const { coinName, issuer } = complianceLabels(coin)
      results.push({
        coinSymbol: coin.symbol,
        coinName,
        issuer,
        chainName: chain.chainName,
        chain: chain.chain,
        contract: chain.contract,
        explorerUrl: chain.explorerUrl,
        rpcUrl: chain.apiUrl,
        status: "error",
        errorMessage: String(err),
      })
    }
    onProgress()
  }
  return results
}

async function runSolanaGroup(
  tasks: Array<{ coin: CoinComplianceConfig; chain: SolanaChainConfig }>,
  solanaAddress: string,
  onProgress: () => void,
): Promise<ChainResult[]> {
  const results: ChainResult[] = []
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0) await sleep(RPC_STAGGER_MS)
    try {
      results.push(await runSolanaCheck(tasks[i].coin, tasks[i].chain, solanaAddress))
    } catch (err) {
      const { coin, chain } = tasks[i]
      const { coinName, issuer } = complianceLabels(coin)
      results.push({
        coinSymbol: coin.symbol,
        coinName,
        issuer,
        chainName: chain.chainName,
        chain: chain.chain,
        contract: chain.contract,
        explorerUrl: chain.explorerUrl,
        rpcUrl: chain.rpcUrl,
        status: "error",
        errorMessage: String(err),
      })
    }
    onProgress()
  }
  return results
}

async function runXrplGroup(
  tasks: Array<{ coin: CoinComplianceConfig; chain: XrplChainConfig }>,
  xrplAddress: string,
  onProgress: () => void,
): Promise<ChainResult[]> {
  const results: ChainResult[] = []
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0) await sleep(RPC_STAGGER_MS)
    try {
      results.push(await runXrplCheck(tasks[i].coin, tasks[i].chain, xrplAddress))
    } catch (err) {
      const { coin, chain } = tasks[i]
      const { coinName, issuer } = complianceLabels(coin)
      results.push({
        coinSymbol: coin.symbol,
        coinName,
        issuer,
        chainName: chain.chainName,
        chain: chain.chain,
        contract: chain.contract,
        explorerUrl: chain.explorerUrl,
        rpcUrl: chain.apiUrl,
        status: "error",
        errorMessage: String(err),
      })
    }
    onProgress()
  }
  return results
}

async function checkAllCoins(
  walletAddress: string | null,
  solanaAddress: string | null,
  xrplAddress: string | null,
  onProgress: (done: number, total: number) => void,
): Promise<ChainResult[]> {
  // ── Collect tasks ──────────────────────────────────────────────────────────
  const byEvmRpc = new Map<string, Array<{ coin: CoinComplianceConfig; chain: EvmChainConfig }>>()
  const tronTasks: Array<{ coin: CoinComplianceConfig; chain: TronChainConfig }> = []
  const solanaTasks: Array<{ coin: CoinComplianceConfig; chain: SolanaChainConfig }> = []
  const xrplTasks: Array<{ coin: CoinComplianceConfig; chain: XrplChainConfig }> = []

  for (const coin of COMPLIANCE_CONFIG) {
    for (const chain of coin.chains) {
      if (chain.support === "evm") {
        // Only queue EVM tasks if an EVM address was provided
        if (walletAddress) {
          const group = byEvmRpc.get(chain.rpcUrl) ?? []
          group.push({ coin, chain })
          byEvmRpc.set(chain.rpcUrl, group)
        }
      } else if (chain.support === "tron") {
        // TRON uses the same key derivation as EVM — requires the EVM address
        if (walletAddress) tronTasks.push({ coin, chain })
      } else if (chain.support === "solana") {
        solanaTasks.push({ coin, chain })
      } else if (chain.support === "xrpl") {
        xrplTasks.push({ coin, chain })
      }
    }
  }

  const totalEvm = Array.from(byEvmRpc.values()).reduce((n, g) => n + g.length, 0)
  const total =
    totalEvm +
    (walletAddress ? tronTasks.length : 0) +
    (solanaAddress ? solanaTasks.length : 0) +
    (xrplAddress ? xrplTasks.length : 0)

  let done = 0
  const tick = () => onProgress(++done, total)

  // ── Run all groups in parallel ─────────────────────────────────────────────
  const groups: Promise<ChainResult[]>[] = [
    // EVM groups (one per RPC provider) — only if EVM address provided
    ...Array.from(byEvmRpc.values()).map((tasks) => runEvmGroup(tasks, walletAddress!, tick)),
    // TRON group (all via TronGrid, staggered) — only if EVM address provided
    ...(tronTasks.length > 0 && walletAddress ? [runTronGroup(tronTasks, walletAddress, tick)] : []),
    // Solana group (only if address provided)
    ...(solanaAddress && solanaTasks.length > 0
      ? [runSolanaGroup(solanaTasks, solanaAddress, tick)]
      : []),
    // XRPL group (only if address provided)
    ...(xrplAddress && xrplTasks.length > 0
      ? [runXrplGroup(xrplTasks, xrplAddress, tick)]
      : []),
  ]

  const settled = await Promise.allSettled(groups)

  const results: ChainResult[] = []
  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(...s.value)
    } else if (process.env.NODE_ENV === "development") {
      console.error("Wallet check: group promise rejected", s.reason)
    }
  }

  // ── Static rows: no-controls, pending-abi, coming-soon ────────────────────
  for (const coin of COMPLIANCE_CONFIG) {
    const { coinName, issuer } = complianceLabels(coin)
    if (!coin.hasComplianceControls) {
      results.push({
        coinSymbol: coin.symbol,
        coinName,
        issuer,
        chainName: UI_EM_DASH,
        chain: "",
        contract: "",
        explorerUrl: null,
        status: "no-controls",
        notes: coin.noControlsReason,
      })
      continue
    }

    for (const chain of coin.chains) {
      if (chain.support === "pending-abi") {
        results.push({
          coinSymbol: coin.symbol,
          coinName,
          issuer,
          chainName: chain.chainName,
          chain: chain.chain,
          contract: chain.contract,
          explorerUrl: chain.explorerUrl,
          status: "pending-abi",
          notes: chain.reason,
          seizureNote: coin.seizureNote,
        })
      } else if (chain.support === "coming-soon") {
        results.push({
          coinSymbol: coin.symbol,
          coinName,
          issuer,
          chainName: chain.chainName,
          chain: chain.chain,
          contract: chain.contract,
          explorerUrl: chain.explorerUrl,
          status: "coming-soon",
          notes: chain.reason,
        })
      } else if (
        (chain.support === "evm" && !walletAddress) ||
        (chain.support === "tron" && !walletAddress) ||
        (chain.support === "solana" && !solanaAddress) ||
        (chain.support === "xrpl" && !xrplAddress)
      ) {
        results.push({
          coinSymbol: coin.symbol,
          coinName,
          issuer,
          chainName: chain.chainName,
          chain: chain.chain,
          contract: chain.contract,
          explorerUrl: chain.explorerUrl,
          status: "not-checked",
        })
      }
    }
  }

  return results
}

// ── Status display helpers ────────────────────────────────────────────────────

const STATUS_META: Record<
  CheckStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  clear:               { label: "Clear",               color: "text-green-400",  icon: CheckCircle2 },
  blacklisted:         { label: "Blacklisted",         color: "text-red-400",    icon: XCircle },
  frozen:              { label: "Frozen",              color: "text-orange-400", icon: ShieldOff },
  "flagged-with-balance": { label: "Flagged + Balance", color: "text-red-400",  icon: ShieldAlert },
  "pending-abi":       { label: "Pending ABI",         color: "text-yellow-500", icon: AlertTriangle },
  "coming-soon":       { label: "Coming soon",         color: "text-muted-foreground", icon: Clock },
  "no-controls":       { label: "No controls",         color: "text-sky-400",          icon: CheckCircle2 },
  "not-checked":       { label: "—",                   color: "text-muted-foreground/40", icon: Minus },
  error:               { label: "RPC error",           color: "text-yellow-500", icon: AlertTriangle },
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.color)}>
      <Icon className="size-3.5 shrink-0" />
      {meta.label}
    </span>
  )
}

// ── Truncate address ──────────────────────────────────────────────────────────

function truncate(addr: string, chars = 8): string {
  if (addr.length <= chars * 2 + 2) return addr
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`
}

// ── Row expand panel ──────────────────────────────────────────────────────────

function DevDetails({ result }: { result: ChainResult }) {
  return (
    <div className={devDetailsPanelClass}>
      <p className="text-muted-foreground mb-2 font-medium uppercase tracking-wide">Dev details</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {result.contract && (
          <>
            <dt className="text-muted-foreground">Contract</dt>
            <dd className="flex items-center gap-1 font-mono">
              <span className="break-all">{result.contract}</span>
              <CopyButton text={result.contract} label="Copy contract address" />
              {result.explorerUrl && (
                <a href={result.explorerUrl} {...explorerIconLinkProps}>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </dd>
          </>
        )}
        {result.fnName && (
          <>
            <dt className="text-muted-foreground">Function</dt>
            <dd className="font-mono">
              {result.selector
                ? `${result.fnName}(address)`
                : result.fnName}
              {result.selector && (
                <span className="text-muted-foreground ml-2">→ {result.selector}</span>
              )}
            </dd>
          </>
        )}

        {result.rpcUrl && (
          <>
            <dt className="text-muted-foreground">RPC</dt>
            <dd className="font-mono break-all">{result.rpcUrl}</dd>
          </>
        )}
        {result.notes && (
          <>
            <dt className="text-muted-foreground">Notes</dt>
            <dd>{result.notes}</dd>
          </>
        )}
        {(result.status === "blacklisted" ||
          result.status === "frozen" ||
          result.status === "flagged-with-balance") &&
          result.seizureNote && (
            <>
              <dt className="text-muted-foreground">Seizure</dt>
              <dd className="text-orange-300">{result.seizureNote}</dd>
            </>
          )}
        {result.errorMessage && (
          <>
            <dt className="text-muted-foreground">Error</dt>
            <dd className="text-yellow-400">{result.errorMessage}</dd>
          </>
        )}
        {result.status === "pending-abi" && (
          <>
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="text-yellow-400">{result.notes}</dd>
          </>
        )}
      </dl>
    </div>
  )
}

// ── Results table ─────────────────────────────────────────────────────────────

function ResultsTable({ results }: { results: ChainResult[] }) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  function toggleRow(key: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Group by coin preserving COMPLIANCE_CONFIG order
  const coinOrder = COMPLIANCE_CONFIG.map((c) => c.symbol)
  const grouped = new Map<string, ChainResult[]>()
  for (const symbol of coinOrder) {
    grouped.set(symbol, [])
  }
  for (const r of results) {
    grouped.get(r.coinSymbol)?.push(r)
  }

  const isFlagged = (r: ChainResult) =>
    r.status === "blacklisted" || r.status === "frozen" || r.status === "flagged-with-balance"

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="px-3 py-2 font-medium">
              Coin
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Chain
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Contract
            </th>
            <th scope="col" className="w-8 px-3 py-2">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from(grouped.entries()).flatMap(([, rows]) =>
            rows.map((result, rowIdx) => {
              const key = `${result.coinSymbol}-${result.chainName}-${rowIdx}`
              const panelId = devDetailsPanelDomId(key)
              const expanded = expandedRows.has(key)
              const flagged = isFlagged(result)
              const isLive = result.status !== "coming-soon" && result.status !== "no-controls" && result.status !== "pending-abi"

              const isNotChecked = result.status === "not-checked"

              return (
                <React.Fragment key={key}>
                  <tr
                    className={cn(
                      "border-b border-border/60 last:border-0 transition-colors",
                      isNotChecked
                        ? "opacity-30"
                        : [
                            flagged && resultsRowTone.flagged,
                            !flagged && isLive && result.status === "clear" && resultsRowTone.clearLive,
                            expanded && resultsRowTone.expanded,
                          ],
                    )}
                  >
                    {/* Coin */}
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{result.coinSymbol}</span>
                        <span className="text-muted-foreground text-xs">{result.issuer}</span>
                      </div>
                    </td>

                    {/* Chain */}
                    <td className="px-3 py-2.5 align-middle">
                      <span
                        className={cn(
                          "text-sm",
                          result.chainName === UI_EM_DASH && "text-muted-foreground",
                        )}
                      >
                        {result.chainName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5 align-middle">
                      {isNotChecked ? (
                        <Minus className="size-3.5 text-muted-foreground/40" />
                      ) : (
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={result.status} />
                          {result.status === "flagged-with-balance" && result.balance !== undefined && (
                            <span className="font-mono text-xs text-red-300">
                              Balance: {result.balance.toLocaleString()} raw units — seizure risk
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Contract */}
                    <td className="px-3 py-2.5 align-middle">
                      {result.contract ? (
                        <div className="flex items-center gap-1">
                          <code className="font-mono text-xs text-muted-foreground">
                            {truncate(result.contract)}
                          </code>
                          {!isNotChecked && result.explorerUrl && (
                            <a href={result.explorerUrl} {...explorerIconLinkProps}>
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">{UI_EM_DASH}</span>
                      )}
                    </td>

                    {/* Expand toggle — hidden for not-checked rows */}
                    <td className="px-3 py-2.5 align-middle">
                      {!isNotChecked && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          onClick={() => toggleRow(key)}
                          title={expanded ? "Hide details" : "Show dev details"}
                          aria-expanded={expanded}
                          aria-controls={panelId}
                          aria-label={
                            expanded
                              ? `Collapse dev details for ${result.coinSymbol} on ${result.chainName}`
                              : `Expand dev details for ${result.coinSymbol} on ${result.chainName}`
                          }
                        >
                          {expanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded dev details */}
                  {expanded && (
                    <tr className="border-b border-border/60 last:border-0">
                      <td id={panelId} colSpan={5} className="p-0">
                        <DevDetails result={result} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            }),
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Summary banner ────────────────────────────────────────────────────────────

function SummaryBanner({
  wallet,
  results,
  checkedAt,
}: {
  wallet: string
  results: ChainResult[]
  checkedAt: string
}) {
  const { flags, live, errors } = getWalletCheckSummary(results)
  const hasFlagged = flags.length > 0
  const hasErrors = errors.length > 0

  const bannerTone = hasFlagged
    ? summaryBannerTone.flagged
    : hasErrors
      ? summaryBannerTone.incomplete
      : summaryBannerTone.clear

  const headlineColor = hasFlagged
    ? "text-red-300"
    : hasErrors
      ? "text-yellow-300"
      : "text-green-300"

  const headlineText = hasFlagged
    ? `${flags.length} flag${flags.length === 1 ? "" : "s"} found`
    : hasErrors
      ? `Check incomplete — ${errors.length} RPC error${errors.length === 1 ? "" : "s"}`
      : "No compliance flags found"

  const HeadlineIcon = hasFlagged
    ? ShieldAlert
    : hasErrors
      ? AlertTriangle
      : CheckCircle2

  const iconColor = hasFlagged ? "text-red-400" : hasErrors ? "text-yellow-400" : "text-green-400"

  return (
    <div className={cn("rounded-lg border px-4 py-3", bannerTone)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <HeadlineIcon className={cn("size-5 shrink-0", iconColor)} />
          <div>
            <p className={cn("font-semibold", headlineColor)}>{headlineText}</p>
            <p className="text-muted-foreground font-mono text-xs">{wallet}</p>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-col items-end gap-0.5 text-xs">
          <span>{live.length} live checks across {new Set(live.map((r) => r.chain)).size} chains</span>
          {hasErrors && (
            <span className="text-yellow-400">{errors.length} check{errors.length === 1 ? "" : "s"} failed — expand row for details</span>
          )}
          <span>Checked {checkedAt}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function WalletChecker() {
  const formUid = React.useId()
  const inputId = `${formUid}-address`
  const hintId = `${formUid}-hint`
  const errorId = `${formUid}-error`

  const router = useRouter()
  const searchParams = useSearchParams()

  const [input, setInput] = React.useState("")
  const [solanaInput, setSolanaInput] = React.useState("")
  const [xrplInput, setXrplInput] = React.useState("")
  const [showNonEvm, setShowNonEvm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null)
  const [results, setResults] = React.useState<ChainResult[] | null>(null)
  const [checkedWallet, setCheckedWallet] = React.useState("")
  const [checkedAt, setCheckedAt] = React.useState("")
  const [inputError, setInputError] = React.useState("")
  const [solanaInputError, setSolanaInputError] = React.useState("")
  const [xrplInputError, setXrplInputError] = React.useState("")
  const [shareCopied, setShareCopied] = React.useState(false)
  const shareCopyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ENS resolution state
  const [ensResolved, setEnsResolved] = React.useState<string | null>(null)
  const [ensResolving, setEnsResolving] = React.useState(false)
  const [ensError, setEnsError] = React.useState<string | null>(null)

  // "pending" → params found on mount, waiting to run; "done" → already ran
  const autoRunState = React.useRef<"idle" | "pending" | "done">("idle")

  // On mount: read URL params and pre-fill inputs
  React.useEffect(() => {
    const paramAddress = searchParams.get("address")?.trim() ?? ""
    const paramSolana = searchParams.get("solana")?.trim() ?? ""
    const paramXrpl = searchParams.get("xrpl")?.trim() ?? ""

    if (!paramAddress && !paramSolana && !paramXrpl) return

    if (paramAddress) setInput(paramAddress)
    if (paramSolana) { setSolanaInput(paramSolana); setShowNonEvm(true) }
    if (paramXrpl) { setXrplInput(paramXrpl); setShowNonEvm(true) }

    autoRunState.current = "pending"
  // searchParams is stable on mount — intentionally run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced ENS resolution — fires 500ms after the user stops typing
  React.useEffect(() => {
    const trimmed = input.trim()
    if (!isEnsName(trimmed)) {
      setEnsResolved(null)
      setEnsError(null)
      setEnsResolving(false)
      return
    }
    setEnsResolving(true)
    setEnsResolved(null)
    setEnsError(null)
    const timer = setTimeout(async () => {
      const { address, error } = await resolveEnsName(trimmed, EVM_RPC_URLS.ethereum_b)
      setEnsResolving(false)
      if (address) {
        setEnsResolved(address)
        if (inputError) setInputError("")
      } else {
        setEnsError(error ?? "Could not resolve ENS name")
      }
    }, 500)
    return () => {
      clearTimeout(timer)
      setEnsResolving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  const ariaDescribedBy = inputError ? `${errorId} ${hintId}` : hintId

  function buildLiveStatusMessage(): string {
    if (loading) {
      return progress
        ? `Checking contracts: ${progress.done} of ${progress.total} completed.`
        : "Starting wallet check."
    }
    if (results) {
      const { flags, errors } = getWalletCheckSummary(results)
      const flagText = `${flags.length} compliance flag${flags.length === 1 ? "" : "s"}.`
      const errorText = errors.length > 0
        ? ` ${errors.length} RPC error${errors.length === 1 ? "" : "s"}.`
        : ""
      return `Check complete. ${flagText}${errorText}`
    }
    return ""
  }
  const liveStatusMessage = buildLiveStatusMessage()

  async function doCheck(
    rawEvmInput: string,
    solana: string | null,
    xrpl: string | null,
    resolvedEvmAddr: string | null,
  ) {
    setLoading(true)
    setProgress(null)
    setResults(null)
    try {
      const data = await checkAllCoins(resolvedEvmAddr, solana, xrpl, (done, total) =>
        setProgress({ done, total }),
      )
      setResults(data)
      setCheckedWallet(resolvedEvmAddr ?? solana ?? xrpl ?? "")
      setCheckedAt(new Date().toLocaleTimeString())

      // Update URL so the check is shareable — use the original input (ENS name or 0x)
      const params = new URLSearchParams()
      if (rawEvmInput) params.set("address", rawEvmInput)
      if (solana) params.set("solana", solana)
      if (xrpl) params.set("xrpl", xrpl)
      router.replace(`?${params.toString()}`, { scroll: false })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  // Auto-run when URL params are present — waits for ENS resolution if needed
  React.useEffect(() => {
    if (autoRunState.current !== "pending") return

    const paramAddress = searchParams.get("address")?.trim() ?? ""
    const paramSolana = searchParams.get("solana")?.trim() || null
    const paramXrpl = searchParams.get("xrpl")?.trim() || null

    // If the address is an ENS name, wait until resolution finishes
    if (paramAddress && isEnsName(paramAddress)) {
      if (ensResolving || (!ensResolved && !ensError)) return
      if (!ensResolved) return
    }

    let resolvedAddr: string | null = null
    if (paramAddress) {
      resolvedAddr = isEnsName(paramAddress) ? ensResolved : (isValidEthAddress(paramAddress) ? paramAddress : null)
      if (!resolvedAddr && !paramSolana && !paramXrpl) return // nothing valid
    }

    autoRunState.current = "done"
    doCheck(paramAddress, paramSolana, paramXrpl, resolvedAddr)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, ensResolved, ensResolving, ensError])

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    const rawInput = input.trim()
    const solana = solanaInput.trim() || null
    const xrpl = xrplInput.trim() || null

    // Resolve the effective EVM address — ENS name or raw 0x address
    let addr: string | null = null
    let hasError = false

    if (rawInput) {
      if (isEnsName(rawInput)) {
        if (ensResolved) {
          addr = ensResolved
        } else if (ensResolving) {
          setInputError("ENS name is still resolving — please wait a moment.")
          return
        } else {
          setInputError(ensError ?? "ENS name could not be resolved. Check the name and try again.")
          hasError = true
        }
      } else if (!isValidEthAddress(rawInput)) {
        setInputError(INVALID_WALLET_MESSAGE)
        hasError = true
      } else {
        addr = rawInput
        setInputError("")
      }
    } else {
      setInputError("")
    }
    if (solana && !isValidSolanaAddress(solana)) {
      setSolanaInputError(INVALID_SOLANA_MESSAGE)
      hasError = true
    } else {
      setSolanaInputError("")
    }
    if (xrpl && !isValidXrplAddress(xrpl)) {
      setXrplInputError(INVALID_XRPL_MESSAGE)
      hasError = true
    } else {
      setXrplInputError("")
    }
    if (hasError) return

    await doCheck(rawInput, solana, xrpl, addr)
  }

  return (
    <div className="space-y-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatusMessage}
      </div>
      {/* Input form */}
      <form onSubmit={handleCheck} aria-busy={loading}>
        <div className="flex items-start gap-3">

          {/* ── Left: stacked address inputs ── */}
          <div className="flex-1 space-y-2">

            {/* EVM / ENS */}
            <div className="space-y-1">
              <Input
                id={inputId}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (inputError) setInputError("")
                }}
                placeholder="0x… address or ENS name (e.g. vitalik.eth)"
                className="font-mono"
                aria-label="EVM wallet address or ENS name"
                aria-invalid={!!inputError}
                aria-describedby={ariaDescribedBy}
                disabled={loading}
                spellCheck={false}
                autoComplete="off"
              />
              {/* ENS resolution feedback */}
              {ensResolving && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> Resolving ENS name…
                </p>
              )}
              {ensResolved && !ensResolving && (
                <p className="flex items-center gap-1.5 font-mono text-xs text-green-400">
                  <CheckCircle2 className="size-3 shrink-0" />
                  {ensResolved}
                  <CopyButton text={ensResolved} label="Copy resolved address" />
                </p>
              )}
              {ensError && !ensResolving && (
                <p className="text-xs text-yellow-500">{ensError}</p>
              )}
              {inputError && (
                <p id={errorId} className="text-destructive text-xs" role="alert">{inputError}</p>
              )}
            </div>

            {/* Toggle for Solana / XRPL */}
            <button
              type="button"
              onClick={() => setShowNonEvm((v) => !v)}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
              aria-expanded={showNonEvm}
            >
              {showNonEvm
                ? <ChevronDown className="size-3.5" />
                : <ChevronRight className="size-3.5" />}
              {showNonEvm ? "Hide" : "Also check"} Solana &amp; XRP Ledger
              <span className="text-muted-foreground/50">(different address formats)</span>
            </button>

            {/* Solana + XRPL inputs (shown when toggled) */}
            {showNonEvm && (
              <div className="space-y-2 pl-4 border-l border-border/60">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-solana`} className="text-xs text-muted-foreground">
                    Solana address
                  </label>
                  <Input
                    id={`${formUid}-solana`}
                    value={solanaInput}
                    onChange={(e) => {
                      setSolanaInput(e.target.value)
                      if (solanaInputError) setSolanaInputError("")
                    }}
                    placeholder={SOLANA_INPUT_PLACEHOLDER}
                    className="font-mono"
                    aria-label="Solana wallet address (optional)"
                    aria-invalid={!!solanaInputError}
                    disabled={loading}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {solanaInputError && (
                    <p className="text-destructive text-xs" role="alert">{solanaInputError}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-xrpl`} className="text-xs text-muted-foreground">
                    XRP Ledger address
                  </label>
                  <Input
                    id={`${formUid}-xrpl`}
                    value={xrplInput}
                    onChange={(e) => {
                      setXrplInput(e.target.value)
                      if (xrplInputError) setXrplInputError("")
                    }}
                    placeholder={XRPL_INPUT_PLACEHOLDER}
                    className="font-mono"
                    aria-label="XRP Ledger address (optional)"
                    aria-invalid={!!xrplInputError}
                    disabled={loading}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {xrplInputError && (
                    <p className="text-destructive text-xs" role="alert">{xrplInputError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Hint */}
            <p id={hintId} className="text-muted-foreground text-xs">
              Read-only — no transaction sent. EVM address also checks TRON.
              Your address is sent to each public RPC you query.
            </p>
          </div>

          {/* ── Right: submit button, pinned to top ── */}
          <Button
            type="submit"
            disabled={loading || (!input.trim() && !solanaInput.trim() && !xrplInput.trim())}
            className="shrink-0 self-start"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {progress ? `${progress.done} / ${progress.total}` : "Starting…"}
              </>
            ) : (
              <>
                <Search className="mr-2 size-4" />
                Check wallet
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <SummaryBanner
            wallet={checkedWallet}
            results={results}
            checkedAt={checkedAt}
          />

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Results</h2>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3" /> expand row for dev details
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    setShareCopied(true)
                    if (shareCopyTimer.current) clearTimeout(shareCopyTimer.current)
                    shareCopyTimer.current = setTimeout(() => setShareCopied(false), 2000)
                  })
                }}
                className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:text-foreground"
                title="Copy shareable link to these results"
              >
                {shareCopied ? (
                  <><CheckCircle2 className="size-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                ) : (
                  <><Link2 className="size-3.5" />Share results</>
                )}
              </button>
            </div>
          </div>

          <ResultsTable results={results} />

          {/* Legend */}
          <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_LEGEND.map(({ status, description }) => (
              <div key={status} className="flex gap-2">
                <StatusBadge status={status} />
                <span className="text-muted-foreground">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
