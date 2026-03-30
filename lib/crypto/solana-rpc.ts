/**
 * Solana SPL / Token-2022 freeze status check via Solana JSON-RPC.
 *
 * Uses getTokenAccountsByOwner to find the wallet's token account for a given
 * mint and checks whether its state is "frozen". No private key or signing
 * required — this is a pure read operation.
 *
 * Classic SPL Token program:  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
 * Token-2022 program:         TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
 *
 * For Token-2022 mints (e.g. PYUSD), we call getTokenAccountsByOwner with
 * { programId } instead of { mint } and then filter the results by mint address,
 * because the classic { mint } filter only searches Token program accounts.
 */

export interface SolanaFreezeResult {
  frozen: boolean
  /** Raw token amount in smallest units (same as ERC-20 raw balance) */
  balance: bigint
  errorMessage?: string
}

/**
 * Check whether a Solana wallet's token account for a given mint is frozen.
 *
 * @param rpcUrl        Solana JSON-RPC endpoint
 * @param mintAddress   SPL / Token-2022 mint address (base58)
 * @param ownerAddress  Wallet to check (base58)
 * @param programId     Token-2022 program ID — omit for classic SPL Token
 */
export async function getSolanaTokenFreezeStatus(
  rpcUrl: string,
  mintAddress: string,
  ownerAddress: string,
  programId?: string,
): Promise<SolanaFreezeResult> {
  // For Token-2022 mints we can't use { mint } directly — use { programId } and filter
  const filter = programId ? { programId } : { mint: mintAddress }

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [ownerAddress, filter, { encoding: "jsonParsed" }],
      }),
    })
    if (!res.ok) {
      return { frozen: false, balance: BigInt(0), errorMessage: `HTTP ${res.status} ${res.statusText}`.trim() }
    }
    const data = await res.json()
    if (data == null || typeof data !== "object") {
      return { frozen: false, balance: BigInt(0), errorMessage: "Invalid Solana RPC response body" }
    }
    if (data.error != null) {
      const err = data.error as { message?: string } | string
      const msg =
        typeof err === "string"
          ? err
          : (typeof err?.message === "string" ? err.message : "Solana RPC error")
      return {
        frozen: false,
        balance: BigInt(0),
        errorMessage: msg || "Solana RPC error",
      }
    }
    // JSON-RPC success must include a result object; otherwise do not treat as "clear"
    if (data.result === null || typeof data.result !== "object") {
      return {
        frozen: false,
        balance: BigInt(0),
        errorMessage: "Invalid Solana RPC response (missing or invalid result)",
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accounts: any[] = data.result?.value ?? []

    // When filtering by programId, we must further filter by mint
    const relevant = programId
      ? accounts.filter((a) => a.account?.data?.parsed?.info?.mint === mintAddress)
      : accounts

    let frozen = false
    let balance = BigInt(0)

    for (const acc of relevant) {
      const info = acc.account?.data?.parsed?.info
      if (!info) continue
      if (info.state === "frozen") frozen = true
      const amount: string | undefined = info.tokenAmount?.amount
      if (amount) {
        try {
          balance += BigInt(amount)
        } catch {
          // ignore parse errors on individual accounts
        }
      }
    }

    return { frozen, balance }
  } catch (e) {
    return { frozen: false, balance: BigInt(0), errorMessage: e instanceof Error ? e.message : "Network error" }
  }
}

/**
 * Validate a Solana base58 address — 32 to 44 characters, base58 charset.
 * This is a format check only; it does not verify the address exists on-chain.
 */
export function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}
