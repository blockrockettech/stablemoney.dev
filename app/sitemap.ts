import type { MetadataRoute } from "next"
import { coins } from "@/data/coins"
import { getAllChainSlugs } from "@/lib/chains"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const root = new URL(base)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: new URL("/", root).href, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/compare", root).href, changeFrequency: "monthly", priority: 0.8 },
  ]

  const coinRoutes: MetadataRoute.Sitemap = coins.map((c) => ({
    url: new URL(`/coins/${c.symbol.toLowerCase()}`, root).href,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const chainRoutes: MetadataRoute.Sitemap = getAllChainSlugs().map((chain) => ({
    url: new URL(`/chains/${chain}`, root).href,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...coinRoutes, ...chainRoutes]
}
