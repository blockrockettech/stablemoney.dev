import type { Metadata } from "next"
import { WalletChecker } from "@/components/WalletChecker"

const title = "Onchain Wallet Compliance Check"
const description =
  "Check if a wallet address is blacklisted, frozen, or at risk of fund seizure across the top stablecoins and EVM chains. Live eth_call — no transaction sent."

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    title,
    description,
  },
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
          <span>All checks are read-only <code className="font-mono">eth_call</code> — no transaction is broadcast.</span>
          <span>Results reflect on-chain state at query time — always re-check before acting.</span>
        </div>
        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          This tool is not a substitute for official sanctions screening. For U.S. Treasury listings, use{" "}
          <a
            href="https://sanctionssearch.ofac.treas.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            OFAC Sanctions List Search
          </a>
          . SDN entries can include digital-currency addresses —{" "}
          <a
            href="https://sanctionssearch.ofac.treas.gov/Details.aspx?id=33151"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            example record (SUEX OTC)
          </a>
          .
        </p>
      </header>

      <WalletChecker />
    </div>
  )
}
