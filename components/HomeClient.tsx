"use client"

import * as React from "react"
import type { Coin, StablecoinType } from "@/types"
import { FilterBar } from "@/components/FilterBar"
import { CoinGrid } from "@/components/CoinGrid"

export function HomeClient({ coins }: { coins: Coin[] }) {
  const [filter, setFilter] = React.useState<"all" | StablecoinType>("all")

  const filtered = React.useMemo(() => {
    if (filter === "all") return coins
    return coins.filter((c) => c.type === filter)
  }, [coins, filter])

  return (
    <div className="space-y-6">
      <FilterBar value={filter} onChange={setFilter} />
      <CoinGrid coins={filtered} />
    </div>
  )
}
