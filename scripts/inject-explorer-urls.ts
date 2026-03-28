/**
 * One-shot: inserts explorerUrl after each network contract in data/coins.ts
 * using getExplorerUrl. Run from repo root: npx tsx scripts/inject-explorer-urls.ts
 * Remove this script after coins.ts is updated (or re-run if regenerating).
 */
import { readFileSync, writeFileSync } from "node:fs"
import { coins } from "../data/coins"
import { getExplorerUrl } from "../lib/explorers"

const path = new URL("../data/coins.ts", import.meta.url)
const urlQueue = coins.flatMap((c) =>
  c.networks.map((n) => getExplorerUrl(n.chain, n.contract))
)

const lines = readFileSync(path, "utf8").split("\n")
const out: string[] = []
let qi = 0
const indent = "        "

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  out.push(line)

  const singleContract =
    /^\s*contract: "/.test(line) && /",\s*$/.test(line.trimEnd())

  if (singleContract) {
    const url = urlQueue[qi++]
    out.push(
      `${indent}explorerUrl: ${url != null ? JSON.stringify(url) : "null"},`
    )
    continue
  }

  if (/^\s*contract:\s*$/.test(line)) {
    i++
    const cont = lines[i]!
    out.push(cont)
    const url = urlQueue[qi++]
    out.push(
      `${indent}explorerUrl: ${url != null ? JSON.stringify(url) : "null"},`
    )
  }
}

if (qi !== urlQueue.length) {
  throw new Error(
    `explorer URL mismatch: injected ${qi}, expected ${urlQueue.length}`
  )
}

writeFileSync(path, out.join("\n"), "utf8")
console.log("Injected", qi, "explorerUrl fields into data/coins.ts")
