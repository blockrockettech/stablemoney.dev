import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Side-by-side feature matrix for top stablecoins — static reference for engineering comparison.",
  openGraph: {
    title: "Compare stablecoins",
    description: "Feature matrix across selected stablecoins.",
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
