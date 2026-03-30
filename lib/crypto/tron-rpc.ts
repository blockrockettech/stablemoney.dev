/**
 * TRON compliance check helpers via TronGrid triggerconstantcontract.
 *
 * TRON uses the same ABI encoding as EVM — same 4-byte selectors, same
 * 32-byte padded parameter layout. The key difference is the API transport
 * and address encoding (41-prefix hex vs 0x-prefix hex).
 *
 * The 20-byte key derivation is identical to EVM (secp256k1 pubkey → keccak256
 * → last 20 bytes), so the same private key produces the same raw address on
 * both networks. We convert the user's EVM address automatically.
 */

export interface TronCallResult {
  /** Raw hex return value from constant_result[0], without "0x" prefix */
  result: string | null
  errorMessage?: string
}

/**
 * Call a TRON smart contract view function via TronGrid.
 *
 * @param apiUrl           TronGrid triggerconstantcontract endpoint
 * @param contractAddress  Base58 TRON address (T-prefix), passed with visible:true
 * @param fnSelector       Function signature string, e.g. "isBlackListed(address)"
 * @param parameter        Hex-encoded ABI params WITHOUT the 4-byte selector
 * @param ownerHex         Caller address in TRON hex format (41-prefixed, no 0x)
 */
export async function tronTriggerConstantContract(
  apiUrl: string,
  contractAddress: string,
  fnSelector: string,
  parameter: string,
  ownerHex: string,
): Promise<TronCallResult> {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_address: ownerHex,
        contract_address: contractAddress,
        function_selector: fnSelector,
        parameter,
        visible: true, // accept base58 contract addresses, return base58 in response
      }),
    })
    if (!res.ok) {
      return { result: null, errorMessage: `HTTP ${res.status} ${res.statusText}`.trim() }
    }
    const data = await res.json()
    // TronGrid returns { constant_result: string[] } on success
    const hex = (data?.constant_result?.[0] as string | undefined) ?? null
    // An empty "0000...0" string is valid (false). A missing key is an error.
    if (hex === null && data?.result?.code) {
      return {
        result: null,
        errorMessage: data.result.message
          ? Buffer.from(data.result.message, "hex").toString("utf8") || data.result.message
          : "TronGrid contract execution failed",
      }
    }
    return { result: hex }
  } catch (e) {
    return { result: null, errorMessage: e instanceof Error ? e.message : "Network error" }
  }
}

/**
 * Convert an EVM address (0x-prefixed, 40 hex chars) to TRON hex format.
 * TRON uses "41" as the mainnet address prefix instead of "0x".
 */
export function evmToTronHex(evmAddress: string): string {
  return "41" + evmAddress.slice(2).toLowerCase()
}

/**
 * Build the 32-byte ABI-encoded parameter for a single address argument.
 * This is the TRON `parameter` field — the ABI calldata AFTER the 4-byte selector.
 */
export function encodeTronAddressParam(evmAddress: string): string {
  return "000000000000000000000000" + evmAddress.slice(2).toLowerCase()
}
