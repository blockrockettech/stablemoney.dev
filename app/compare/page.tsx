"use client"

import * as React from "react"
import { coins } from "@/data/coins"
import type { Coin } from "@/types"
import { CompareMatrix } from "@/components/CompareMatrix"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sorted = [...coins].sort((a, b) => a.rank - b.rank)

export default function ComparePage() {
  const [a, setA] = React.useState<Coin | null>(sorted[0] ?? null)
  const [b, setB] = React.useState<Coin | null>(sorted[1] ?? null)
  const [c, setC] = React.useState<Coin | null>(sorted[2] ?? null)
  const [d, setD] = React.useState<Coin | null>(sorted[3] ?? null)

  const selected = [a, b, c, d].filter(Boolean) as Coin[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Select up to four stablecoins. Rows list the union of feature names; a
          checkmark means that coin&apos;s data includes a feature with that exact name.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CoinSelect label="Coin A" value={a} onChange={setA} />
        <CoinSelect label="Coin B" value={b} onChange={setB} />
        <CoinSelect label="Coin C" value={c} onChange={setC} />
        <CoinSelect label="Coin D" value={d} onChange={setD} />
      </div>

      <CompareMatrix coins={selected} />
    </div>
  )
}

function CoinSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: Coin | null
  onChange: (c: Coin | null) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <Select
        value={value?.symbol ?? "__none__"}
        onValueChange={(v) => {
          if (v === "__none__") onChange(null)
          else onChange(sorted.find((x) => x.symbol === v) ?? null)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {sorted.map((coin) => (
            <SelectItem key={coin.symbol} value={coin.symbol}>
              {coin.symbol} — {coin.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
