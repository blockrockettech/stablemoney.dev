import type { Metadata } from "next"
import localFont from "next/font/local"
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SearchBar } from "@/components/SearchBar"
import {
  SITE_CANONICAL_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  LAST_UPDATED,
} from "@/lib/site"
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-card/30 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Link
                    href="/"
                    className="hover:text-primary block text-xl font-semibold tracking-tight"
                  >
                    {SITE_NAME}
                  </Link>
                  <p className="text-muted-foreground max-w-md text-sm">
                    {SITE_TAGLINE}
                  </p>
                  <nav className="flex flex-wrap gap-3 text-sm font-medium">
                    <Link href="/" className="hover:text-primary text-muted-foreground">
                      Home
                    </Link>
                    <Link
                      href="/compare"
                      className="hover:text-primary text-muted-foreground"
                    >
                      Compare
                    </Link>
                    <Link
                      href="/standards"
                      className="hover:text-primary text-muted-foreground"
                    >
                      Standards
                    </Link>
                  </nav>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <SearchBar className="min-w-[240px] flex-1 sm:max-w-md" />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-border bg-card/20">
              <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {SITE_NAME} — static reference data for engineers. Last updated{" "}
                    {LAST_UPDATED}.
                  </span>
                  <span className="font-mono text-xs">
                    No live prices or on-chain oracles in v1.
                  </span>
                </div>
                <p className="text-muted-foreground border-border/60 text-xs leading-relaxed sm:border-t sm:pt-4">
                  Built with love from Manchester by{" "}
                  <a
                    href="https://blockrocket.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    BlockRocket.tech
                  </a>
                  .
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
