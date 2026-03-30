export type WalletCheckSummaryRow = {
  status: string
  chain: string
  errorMessage?: string
}

/**
 * Pure summary counts for wallet compliance results — shared with WalletChecker and unit tests.
 *
 * Rows count as errors when status is "error" or when errorMessage is set (defensive: RPC helpers
 * should always set status "error" in that case, but the banner must not read "all clear" if not).
 */
export function getWalletCheckSummary(
  results: WalletCheckSummaryRow[],
): {
  flags: WalletCheckSummaryRow[]
  live: WalletCheckSummaryRow[]
  errors: WalletCheckSummaryRow[]
} {
  const flags = results.filter(
    (r) =>
      r.status === "blacklisted" ||
      r.status === "frozen" ||
      r.status === "flagged-with-balance",
  )
  const live = results.filter(
    (r) =>
      r.status !== "coming-soon" &&
      r.status !== "no-controls" &&
      r.status !== "pending-abi" &&
      r.status !== "not-checked",
  )
  const errors = results.filter(
    (r) => r.status === "error" || Boolean(r.errorMessage?.trim()),
  )
  return { flags, live, errors }
}
