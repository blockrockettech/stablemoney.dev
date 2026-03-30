import type { Metadata } from "next"
import { WalletChecker } from "@/components/WalletChecker"

export const metadata: Metadata = {
  title: "Onchain wallet compliance check",
  description:
    "Check if a wallet address is blacklisted, frozen, or at risk of fund seizure across the top stablecoins and EVM chains. Live eth_call — no transaction sent.",
}

export default function WalletCheckPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Onchain wallet compliance check</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Paste any EVM wallet address to query the top stablecoins across all tracked chains in
          real time. Checks for{" "}
          <span className="text-foreground font-medium">blacklisting</span>,{" "}
          <span className="text-foreground font-medium">freezing</span>, and{" "}
          <span className="text-foreground font-medium">seized-funds risk</span> — useful for
          sanctions screening, integration testing, and pre-flight compliance checks before
          sending or processing a payment.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>All checks are read-only <code className="font-mono">eth_call</code> — no transaction is broadcast</span>
          <span>Results reflect on-chain state at query time — always re-check before acting</span>
          <span>Non-EVM chains (TRON, Solana, XRPL) shown with coming-soon status</span>
        </div>
      </header>

      <WalletChecker />
    </div>
  )
}
