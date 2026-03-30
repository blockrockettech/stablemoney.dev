import type { MetadataRoute } from "next"
import { coins } from "@/data/coins"
import { LAST_UPDATED, SITE_CANONICAL_URL } from "@/lib/site"

/** Bump `LAST_UPDATED` in `@/lib/site` when curated data changes meaningfully */
const lastModified = new Date(LAST_UPDATED)

function url(path: string, root: URL): string {
  return new URL(path.replace(/^\//, ""), root).href
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CANONICAL_URL).replace(/\/$/, "")
  const root = new URL(`${base}/`)

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: url("/", root),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: url("/standards", root),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: url("/onchain-wallet-check", root),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ]

  const coinRoutes: MetadataRoute.Sitemap = coins.map((c) => ({
    url: url(`/coins/${c.symbol.toLowerCase()}`, root),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  const coinEipRoutes: MetadataRoute.Sitemap = coins.map((c) => ({
    url: url(`/coins/${c.symbol.toLowerCase()}/eips`, root),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...coinRoutes, ...coinEipRoutes]
}
