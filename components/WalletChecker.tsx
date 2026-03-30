"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
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
  SELECTORS,
  type CoinComplianceConfig,
  type EvmChainConfig,
} from "@/data/compliance"
import {
  decodeBool,
  decodeUint256,
  encodeCall,
  jsonRpcEthCall,
} from "@/lib/evm-json-rpc"
import { getWalletCheckSummary } from "@/lib/wallet-check-summary"

// ── Types ─────────────────────────────────────────────────────────────────────

export type CheckStatus =
  | "clear"
  | "blacklisted"
  | "frozen"
  | "flagged-with-balance"   // blacklisted/frozen AND non-zero balance — seizure risk
  | "pending-abi"
  | "coming-soon"
  | "no-controls"
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

const RPC_UNEXPECTED_RESPONSE =
  "RPC call returned null or unexpected response. CORS or rate-limit issue."

const WALLET_INPUT_PLACEHOLDER = "0x… wallet address"

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
      "Non-EVM chain (TRON, Solana, XRPL) — architecture slot ready, network support pending.",
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
  clear: "border-green-800/60 bg-green-950/30",
  flagged: "border-red-800/60 bg-red-950/30",
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

// ── Core check runner ─────────────────────────────────────────────────────────

async function runEvmCheck(
  coin: CoinComplianceConfig,
  chain: EvmChainConfig,
  walletAddress: string,
): Promise<ChainResult> {
  const base: Omit<ChainResult, "status" | "fnName" | "selector" | "balance" | "errorMessage"> = {
    coinSymbol: coin.symbol,
    coinName: coin.name,
    issuer: coin.issuer,
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

// ── Staggered RPC group runner ────────────────────────────────────────────────
// Groups all checks by RPC URL so each endpoint is only queried at most once
// every RPC_STAGGER_MS. Different endpoints run fully in parallel.

async function runRpcGroup(
  tasks: Array<{ coin: CoinComplianceConfig; chain: EvmChainConfig }>,
  walletAddress: string,
  onProgress: () => void,
): Promise<ChainResult[]> {

  const results: ChainResult[] = []
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0) await sleep(RPC_STAGGER_MS)
    try {
      const result = await runEvmCheck(tasks[i].coin, tasks[i].chain, walletAddress)
      results.push(result)
    } catch (err) {
      const { coin, chain } = tasks[i]
      results.push({
        coinSymbol: coin.symbol,
        coinName: coin.name,
        issuer: coin.issuer,
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

async function checkAllCoins(
  walletAddress: string,
  onProgress: (done: number, total: number) => void,
): Promise<ChainResult[]> {
  // Collect all EVM tasks and group by RPC URL
  const byRpc = new Map<string, Array<{ coin: CoinComplianceConfig; chain: EvmChainConfig }>>()

  for (const coin of COMPLIANCE_CONFIG) {
    for (const chain of coin.chains) {
      if (chain.support === "evm") {
        const group = byRpc.get(chain.rpcUrl) ?? []
        group.push({ coin, chain })
        byRpc.set(chain.rpcUrl, group)
      }
    }
  }

  const totalEvm = Array.from(byRpc.values()).reduce((n, g) => n + g.length, 0)
  let done = 0
  const tick = () => onProgress(++done, totalEvm)

  // All RPC groups run in parallel; checks within each group are staggered
  const settled = await Promise.allSettled(
    Array.from(byRpc.values()).map((tasks) => runRpcGroup(tasks, walletAddress, tick)),
  )

  const results: ChainResult[] = []
  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(...s.value)
    } else if (process.env.NODE_ENV === "development") {
      // runRpcGroup should not reject (errors become per-row status) — log if it does
      console.error("Wallet check: RPC group promise rejected", s.reason)
    }
  }

  // Static rows for non-EVM / pending / no-controls
  for (const coin of COMPLIANCE_CONFIG) {
    if (!coin.hasComplianceControls) {
      results.push({
        coinSymbol: coin.symbol,
        coinName: coin.name,
        issuer: coin.issuer,
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
          coinName: coin.name,
          issuer: coin.issuer,
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
          coinName: coin.name,
          issuer: coin.issuer,
          chainName: chain.chainName,
          chain: chain.chain,
          contract: chain.contract,
          explorerUrl: chain.explorerUrl,
          status: "coming-soon",
          notes: chain.reason,
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
              {result.fnName}(address)
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

              return (
                <React.Fragment key={key}>
                  <tr
                    className={cn(
                      "border-b border-border/60 last:border-0 transition-colors",
                      flagged && resultsRowTone.flagged,
                      !flagged && isLive && result.status === "clear" && resultsRowTone.clearLive,
                      expanded && resultsRowTone.expanded,
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
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={result.status} />
                        {result.status === "flagged-with-balance" && result.balance !== undefined && (
                          <span className="font-mono text-xs text-red-300">
                            Balance: {result.balance.toLocaleString()} raw units — seizure risk
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contract */}
                    <td className="px-3 py-2.5 align-middle">
                      {result.contract ? (
                        <div className="flex items-center gap-1">
                          <code className="font-mono text-xs text-muted-foreground">
                            {truncate(result.contract)}
                          </code>
                          {result.explorerUrl && (
                            <a href={result.explorerUrl} {...explorerIconLinkProps}>
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">{UI_EM_DASH}</span>
                      )}
                    </td>

                    {/* Expand toggle */}
                    <td className="px-3 py-2.5 align-middle">
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
  const allClear = flags.length === 0

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        allClear ? summaryBannerTone.clear : summaryBannerTone.flagged,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {allClear ? (
            <CheckCircle2 className="size-5 shrink-0 text-green-400" />
          ) : (
            <ShieldAlert className="size-5 shrink-0 text-red-400" />
          )}
          <div>
            <p className={cn("font-semibold", allClear ? "text-green-300" : "text-red-300")}>
              {allClear
                ? "No compliance flags found"
                : `${flags.length} flag${flags.length === 1 ? "" : "s"} found`}
            </p>
            <p className="text-muted-foreground font-mono text-xs">{wallet}</p>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-col items-end gap-0.5 text-xs">
          <span>{live.length} live checks across {new Set(live.map((r) => r.chain)).size} chains</span>
          {errors.length > 0 && (
            <span className="text-yellow-400">{errors.length} RPC error{errors.length === 1 ? "" : "s"}</span>
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

  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null)
  const [results, setResults] = React.useState<ChainResult[] | null>(null)
  const [checkedWallet, setCheckedWallet] = React.useState("")
  const [checkedAt, setCheckedAt] = React.useState("")
  const [inputError, setInputError] = React.useState("")

  const ariaDescribedBy = inputError ? `${errorId} ${hintId}` : hintId
  const liveStatusMessage = loading
    ? progress
      ? `Checking contracts: ${progress.done} of ${progress.total} completed.`
      : "Starting wallet check."
    : results
      ? (() => {
          const { flags, errors } = getWalletCheckSummary(results)
          return `Check complete. ${flags.length} compliance flag${flags.length === 1 ? "" : "s"}.${errors.length > 0 ? ` ${errors.length} RPC error${errors.length === 1 ? "" : "s"}.` : ""}`
        })()
      : ""

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    const addr = input.trim()

    if (!isValidEthAddress(addr)) {
      setInputError(INVALID_WALLET_MESSAGE)
      return
    }

    setInputError("")
    setLoading(true)
    setProgress(null)
    setResults(null)

    try {
      const data = await checkAllCoins(addr, (done, total) =>
        setProgress({ done, total }),
      )
      setResults(data)
      setCheckedWallet(addr)
      setCheckedAt(new Date().toLocaleTimeString())
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const totalEvmChecks = COMPLIANCE_CONFIG.flatMap((c) =>
    c.chains.filter((ch) => ch.support === "evm"),
  ).length

  return (
    <div className="space-y-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatusMessage}
      </div>
      {/* Input form */}
      <form
        onSubmit={handleCheck}
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        aria-busy={loading}
      >
        <div className="flex-1 space-y-1.5">
          <Input
            id={inputId}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (inputError) setInputError("")
            }}
            placeholder={WALLET_INPUT_PLACEHOLDER}
            className="font-mono"
            aria-label="Wallet address"
            aria-invalid={!!inputError}
            aria-describedby={ariaDescribedBy}
            disabled={loading}
            spellCheck={false}
            autoComplete="off"
          />
          {inputError ? (
            <p id={errorId} className="text-destructive text-xs" role="alert">
              {inputError}
            </p>
          ) : null}
          <p id={hintId} className="text-muted-foreground text-xs">
            Read-only <code className="font-mono">eth_call</code> — no transaction is sent. Checks{" "}
            {totalEvmChecks} live EVM contracts. Your address is sent to each public RPC you query
            (third-party visibility).
          </p>
        </div>
        <Button type="submit" disabled={loading || !input.trim()} className="shrink-0">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {progress
                ? `${progress.done} / ${progress.total}`
                : "Starting…"}
            </>
          ) : (
            <>
              <Search className="mr-2 size-4" />
              Check wallet
            </>
          )}
        </Button>
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
