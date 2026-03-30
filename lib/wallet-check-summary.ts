/**
 * Pure summary counts for wallet compliance results — shared with WalletChecker and unit tests.
 */
export function getWalletCheckSummary(
  results: { status: string; chain: string }[],
): {
  flags: { status: string; chain: string }[]
  live: { status: string; chain: string }[]
  errors: { status: string; chain: string }[]
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
      r.status !== "pending-abi",
  )
  const errors = results.filter((r) => r.status === "error")
  return { flags, live, errors }
}
