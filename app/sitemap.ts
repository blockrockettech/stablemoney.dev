import type { MetadataRoute } from "next"
import { coins } from "@/data/coins"
import { getAllChainSlugs } from "@/lib/chains"
import { SITE_CANONICAL_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CANONICAL_URL
  const root = new URL(base)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: new URL("/", root).href, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/standards", root).href, changeFrequency: "monthly", priority: 0.85 },
  ]

  const coinRoutes: MetadataRoute.Sitemap = coins.map((c) => ({
    url: new URL(`/coins/${c.symbol.toLowerCase()}`, root).href,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const coinEipRoutes: MetadataRoute.Sitemap = coins.map((c) => ({
    url: new URL(`/coins/${c.symbol.toLowerCase()}/eips`, root).href,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))

  const chainRoutes: MetadataRoute.Sitemap = getAllChainSlugs().map((chain) => ({
    url: new URL(`/chains/${chain}`, root).href,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...coinRoutes, ...coinEipRoutes, ...chainRoutes]
}
