import type { Metadata } from "next"
import localFont from "next/font/local"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import {
  SITE_CANONICAL_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  LAST_UPDATED,
} from "@/lib/site"
import { getDataFreshness, isDynamic } from "@/lib/market-data"
import { cn } from "@/lib/utils"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CANONICAL_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — stablecoin technical reference`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: siteUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
              <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3">
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                  <Image
                    src="/favicon.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-md"
                    aria-hidden="true"
                  />
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold tracking-tight text-primary">
                      Stable
                    </span>
                    <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                      Money
                    </span>
                    <span className="font-mono text-sm font-medium text-muted-foreground">.dev</span>
                  </span>
                </Link>

                <span className="text-muted-foreground/40 hidden text-sm sm:inline">|</span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {SITE_TAGLINE}
                </span>

                <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
                  <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
                    Home
                  </Link>
                  <Link href="/standards" className="text-muted-foreground transition-colors hover:text-primary">
                    Standards
                  </Link>
                  <Link href="/onchain-wallet-check" className="text-muted-foreground transition-colors hover:text-primary">
                    Wallet check
                  </Link>
                </nav>
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
      </body>
    </html>
  )
}

function Footer() {
  const dynamic = isDynamic()
  const freshness = getDataFreshness()

  return (
    <footer className="border-t border-border bg-card/20">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {SITE_NAME} — technical reference data for engineers. Last updated{" "}
            {LAST_UPDATED}.
          </span>
          {dynamic && freshness ? (
            <span className="font-mono text-xs">Market data refreshed {freshness}</span>
          ) : (
            <span className="font-mono text-xs">Market data: static</span>
          )}
        </div>
        <p className="text-muted-foreground/80 text-xs leading-relaxed">
          Market cap and chain data sourced from{" "}
          <a
            href="https://defillama.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            DefiLlama
          </a>
          . EIP/ERC analysis, contract details, and risk assessments are manually
          curated. Always verify the deployment you integrate.
        </p>
        <p className="text-muted-foreground border-border/60 text-xs leading-relaxed sm:border-t sm:pt-4">
          Built with love ❤️ from Manchester 🐝 by{" "}
          <a
            href="https://blockrocket.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            BlockRocket.tech 🚀
          </a>{" "}
          — follow on{" "}
          <a
            href="https://x.com/blockrockettech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            X
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
