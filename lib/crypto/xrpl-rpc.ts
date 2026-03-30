/**
 * XRP Ledger trustline freeze check via XRPL JSON-RPC (account_lines).
 *
 * On the XRPL, stablecoin issuers can freeze individual trustlines using the
 * freeze authority. `freeze_peer: true` in an account_lines entry means the
 * ISSUER has frozen OUR trustline — we cannot send or receive that IOU.
 *
 * Note: `freeze: true` means WE froze the issuer's side (an individual freeze
 * action we can take ourselves, unrelated to compliance enforcement).
 */

export interface XrplFreezeResult {
  frozen: boolean
  /** Balance as a decimal string in RLUSD units (e.g. "1500.000000") */
  balance: string
  errorMessage?: string
}

/**
 * Check whether an XRPL account's trustline to a given issuer is frozen by
 * that issuer (freeze_peer flag).
 *
 * @param apiUrl         XRPL JSON-RPC endpoint (e.g. https://xrplcluster.com/)
 * @param accountAddress XRPL r-address of the wallet to check
 * @param currency       Hex currency code (20 bytes, e.g. "524C555344000000000000000000000000000000" for RLUSD)
 * @param issuer         XRPL address of the currency issuer
 */
export async function getXrplTrustlineFreezeStatus(
  apiUrl: string,
  accountAddress: string,
  currency: string,
  issuer: string,
): Promise<XrplFreezeResult> {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_lines",
        params: [{ account: accountAddress, ledger_index: "current" }],
      }),
    })
    if (!res.ok) {
      return { frozen: false, balance: "0", errorMessage: `HTTP ${res.status} ${res.statusText}`.trim() }
    }
    const data = await res.json()
    const err = data.result?.error
    if (err) {
      // "actNotFound" means the account doesn't exist yet (no trustlines) — treat as clear
      if (err === "actNotFound") return { frozen: false, balance: "0" }
      return {
        frozen: false,
        balance: "0",
        errorMessage: (data.result.error_message as string | undefined) ?? String(err),
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines: any[] = data.result?.lines ?? []
    // Find the trustline for this specific currency + issuer
    const line = lines.find((l) => l.currency === currency && l.account === issuer)

    // freeze_peer: issuer froze our trustline (compliance enforcement)
    return {
      frozen: line?.freeze_peer === true,
      balance: typeof line?.balance === "string" ? line.balance : "0",
    }
  } catch (e) {
    return { frozen: false, balance: "0", errorMessage: e instanceof Error ? e.message : "Network error" }
  }
}

/**
 * Validate an XRPL r-address — starts with "r", 25–35 chars, base58 charset.
 * Format check only; does not verify the address exists on-chain.
 */
export function isValidXrplAddress(addr: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(addr)
}
