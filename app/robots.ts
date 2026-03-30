import type { MetadataRoute } from "next"
import { SITE_CANONICAL_URL } from "@/site/config"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CANONICAL_URL
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  }
}
