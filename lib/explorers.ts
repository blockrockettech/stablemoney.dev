/** Explorer URL for a token/contract on a canonical block explorer, when applicable */
export function getExplorerUrl(chain: string, contract: string): string | null {
  const c = chain.toLowerCase().trim()
  const addr = contract.trim()

  if (!addr || addr.startsWith("See ") || addr.startsWith("Issuer:")) {
    return null
  }

  if (addr.startsWith("Property ID:")) {
    return "https://www.omniexplorer.info/lookupasset.aspx?asset=31"
  }

  if (addr.startsWith("0x") && addr.length === 42) {
    const evm: Record<string, string> = {
      ethereum: "https://etherscan.io/token/",
      bnb: "https://bscscan.com/token/",
      arbitrum: "https://arbiscan.io/token/",
      polygon: "https://polygonscan.com/token/",
      optimism: "https://optimistic.etherscan.io/token/",
      base: "https://basescan.org/token/",
      avalanche: "https://snowtrace.io/token/",
      zksync: "https://explorer.zksync.io/token/",
    }
    const base = evm[c]
    if (base) return `${base}${addr}`
  }

  if (c === "solana" && addr.length >= 32) {
    return `https://solscan.io/token/${addr}`
  }

  if (c === "tron" && addr.startsWith("T")) {
    return `https://tronscan.org/#/token20/${addr}`
  }

  if (c === "ton" && (addr.startsWith("EQ") || addr.startsWith("UQ"))) {
    return `https://tonviewer.com/${addr}`
  }

  if (c === "stellar" && addr.length > 20) {
    return `https://stellarchain.io/assets/${addr}`
  }

  if (c === "near" && addr.includes(".near")) {
    return `https://nearblocks.io/address/${encodeURIComponent(addr)}`
  }

  if (c === "hedera" && addr.includes(".")) {
    return `https://hashscan.io/mainnet/token/${addr}`
  }

  if (c === "starknet" && addr.startsWith("0x")) {
    return `https://starkscan.co/token/${addr}`
  }

  if (c === "xrp") {
    return "https://xrpscan.com/"
  }

  if (c === "sui" && addr.startsWith("0x")) {
    return `https://suiscan.xyz/mainnet/coin/${addr}`
  }

  if (c === "aptos" && addr.includes("::")) {
    return "https://explorer.aptoslabs.com/"
  }

  return null
}

export function shortAddress(addr: string, head = 6, tail = 4): string {
  const t = addr.trim()
  if (t.length <= head + tail + 1) return t
  return `${t.slice(0, head)}…${t.slice(-tail)}`
}
