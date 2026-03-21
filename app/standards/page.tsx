import type { Metadata } from "next"
import { EIPS } from "@/data/eips"
import type { EipCategory } from "@/types/eip"
import { EipMatrix } from "@/components/EipMatrix"
import { EipCategorySection } from "@/components/EipCategorySection"

export const metadata: Metadata = {
  title: "ERC / EIP standards in stablecoins",
  description:
    "How USDC, USDT, DAI, USDS, and USD1 implement core token, signature, proxy, and vault standards — with on-chain notes for integrators.",
}

const CATEGORY_ORDER: EipCategory[] = [
  "core",
  "signature",
  "upgradeability",
  "vault",
  "compliance",
]

export default function StandardsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight">ERC / EIP standards in stablecoins</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Deep reference for EVM deployments in scope:{" "}
          <span className="text-foreground font-medium">USDT</span>,{" "}
          <span className="text-foreground font-medium">USDC</span>,{" "}
          <span className="text-foreground font-medium">USDe</span>,{" "}
          <span className="text-foreground font-medium">DAI</span>,{" "}
          <span className="text-foreground font-medium">USDS</span>,{" "}
          <span className="text-foreground font-medium">FDUSD</span>,{" "}
          <span className="text-foreground font-medium">PYUSD</span>,{" "}
          <span className="text-foreground font-medium">FRAX</span>,{" "}
          <span className="text-foreground font-medium">TUSD</span>, and{" "}
          <span className="text-foreground font-medium">USD1</span> — ERC-20 surface, typed data
          (EIP-712), permit (EIP-2612), authorizations (EIP-3009), proxies (EIP-1967 / EIP-1822),
          vaults (ERC-4626), and contract signatures (EIP-1271). Use the matrix for a glance;
          expand sections for function lists, type hashes, and integration footguns. Some entries
          are chain-specific (e.g. BNB vs Ethereum); always verify the deployment you integrate.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comparison matrix</h2>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Rows are standards from the master registry; columns follow static rank order. Hover a
          cell for a one-line developer impact note.
        </p>
        <EipMatrix />
      </section>

      <section className="space-y-16">
        <h2 className="text-2xl font-semibold tracking-tight">Standards deep dive</h2>
        {CATEGORY_ORDER.map((category) => (
          <EipCategorySection
            key={category}
            category={category}
            eips={EIPS.filter((e) => e.category === category)}
          />
        ))}
      </section>
    </div>
  )
}
