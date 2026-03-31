"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchCoins } from "@/site/search"
import type { Coin } from "@/types"
import { CoinCard } from "@/components/CoinCard"
import { getMarketCapRank } from "@/lib/market-data/market-data"
import { cn } from "@/lib/utils"

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const results = React.useMemo(() => {
    if (!query.trim()) return [] as Coin[]
    return searchCoins(query).slice(0, 8)
  }, [query])

  React.useEffect(() => {
    function handleDocumentMouseDown(e: MouseEvent) {
      if (!inputRef.current?.parentElement?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleDocumentMouseDown)
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown)
  }, [])

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search name, symbol, issuer, features…"
          className="bg-background/80 pl-9"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
        />
      </div>
      {open && query.trim() && results.length > 0 ? (
        <div
          className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-[min(70vh,520px)] w-full overflow-y-auto rounded-lg border border-border p-2 shadow-lg"
          role="listbox"
        >
          <div className="grid gap-2">
            {results.map((c) => (
              <button
                key={c.symbol}
                type="button"
                role="option"
                aria-selected={false}
                className="text-left"
                onClick={() => {
                  router.push(`/coins/${c.symbol.toLowerCase()}`)
                  setOpen(false)
                  setQuery("")
                }}
              >
                <CoinCard
                  coin={c}
                  marketCapRank={getMarketCapRank(c.symbol)}
                  asLink={false}
                  className="pointer-events-none"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
