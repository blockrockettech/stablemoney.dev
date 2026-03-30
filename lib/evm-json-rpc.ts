/** Browser-safe JSON-RPC helpers for eth_call (wallet compliance checks). */

export function encodeCall(selector: string, address: string): string {
  const addr = address.replace(/^0x/i, "").toLowerCase().padStart(40, "0")
  return `${selector}000000000000000000000000${addr}`
}

export function decodeBool(result: string | null): boolean | null {
  if (!result || result === "0x" || result.length < 3) return null
  return result.slice(-1) === "1"
}

export function decodeUint256(result: string | null): bigint | null {
  if (!result || result === "0x") return null
  try {
    return BigInt(result)
  } catch {
    return null
  }
}

export type EthCallResponse = {
  result: string | null
  /** HTTP failure, JSON-RPC error object, or thrown network error */
  errorMessage?: string
}

export async function jsonRpcEthCall(
  rpcUrl: string,
  contract: string,
  data: string,
): Promise<EthCallResponse> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: contract, data }, "latest"],
        id: 1,
      }),
    })
    if (!res.ok) {
      return { result: null, errorMessage: `HTTP ${res.status} ${res.statusText}`.trim() }
    }
    const json = (await res.json()) as {
      result?: string
      error?: { code?: number; message?: string }
    }
    if (json.error) {
      const code = json.error.code != null ? ` (code ${json.error.code})` : ""
      const msg = json.error.message?.trim() || "JSON-RPC error"
      return { result: null, errorMessage: `${msg}${code}` }
    }
    return {
      result: typeof json.result === "string" ? json.result : null,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error"
    return { result: null, errorMessage: message }
  }
}
