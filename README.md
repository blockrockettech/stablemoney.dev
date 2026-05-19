# StableMoney.Dev

Technical reference site for engineers and DeFi developers: the top stablecoins by market cap, with networks, contracts, features, and risk notes. **Market cap** (and total tracked cap) is refreshed at build time from [DefiLlama](https://defillama.com/). **Per-coin chain lists and counts** come from manually curated deployments in `data/coins.ts` (official / documented networks only — not every DefiLlama-indexed bridge variant). Live at [stablemoney.dev](https://stablemoney.dev).

[Netlify Status](https://app.netlify.com/projects/stablemoneydev/deploys)

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/)
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) (RSC) for supplementary MDX on coin pages
- [Fuse.js](https://fusejs.io/) for client-side fuzzy search
- [next-themes](https://github.com/pacocoursey/next-themes) (dark default + light toggle)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `npm run dev`              | Development server                                         |
| `npm run build`            | Production build (runs `prebuild` automatically)           |
| `npm run prebuild`         | Fetch live market data from DefiLlama                      |
| `npm run start`            | Run production server                                      |
| `npm run lint`             | ESLint                                                     |
| `npm run format`           | Prettier write                                             |
| `npm run format:check`     | Prettier check                                             |
| `npm run test`             | Run test suite (Vitest)                                    |
| `npm run test:watch`       | Vitest in watch mode                                       |
| `npm run check-proxy`      | Validate proxy metadata in `coins.ts` against on-chain data |

### Proxy validation script

`scripts/check-proxy-status.ts` reads EIP-1967 and EIP-1822 storage slots for every EVM deployment in `coins.ts` and compares the detected proxy type against the static `proxyType` field.

```bash
# Check all coins
npm run check-proxy

# Filter to one coin
npx tsx scripts/check-proxy-status.ts --coin USDC

# Filter to one coin + chain
npx tsx scripts/check-proxy-status.ts --coin GHO --chain arbitrum
```

It prints a per-deployment result (✓ match / ✗ mismatch) and exits with code 1 if any mismatches are found. Run this after editing proxy metadata in `coins.ts` to confirm the static data matches the live contract.

## Project layout

- `app/` — Routes: home, `/coins/[symbol]`, `/coins/[symbol]/eips`, `/onchain-wallet-check`, `/standards`, `sitemap.ts`, `robots.ts`
- `components/` — UI: cards, filters, search, tables
- `data/coins.ts` — Typed coin dataset (networks, proxy metadata, features, risks)
- `data/coinEips.ts` — EIP/ERC standard definitions and per-coin implementation profiles
- `scripts/` — One-off maintenance scripts (`fetch-market-data.ts`, `check-proxy-status.ts`)
- `site/` — Site config, coin search (Fuse), feature merge helpers, MDX loader, and `site/content/coins/*.mdx` for optional coin page sections
- `lib/` — Market data, crypto RPC helpers, EIP utilities, proxy label constants, etc.

## Environment

Copy `.env.example` to `.env.local`. Defaults use `https://stablemoney.dev` when unset. For local Open Graph / sitemap URLs, set:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

V1 does not require API keys.

## Deploy

Build with `npm run build` and run with `npm run start` on any Node host, or use your platform’s Next.js integration. `NEXT_PUBLIC_SITE_URL` defaults to `https://stablemoney.dev`; override for staging or local builds if needed.

### Netlify

- `netlify.toml` is included with:
  - build command: `npm run build` (runs `prebuild` first via npm lifecycle, fetching DefiLlama data)
  - default production URL: `NEXT_PUBLIC_SITE_URL=https://stablemoney.dev`
- In Netlify site settings, set the same env var for Production:
  - `NEXT_PUBLIC_SITE_URL=https://stablemoney.dev`
- Connect your repository, deploy, then attach `stablemoney.dev` in Domain management.

#### Daily data refresh (cron rebuild)

Market cap and chain counts are fetched at build time. To keep them fresh:

1. In Netlify go to **Site settings > Build & deploy > Build hooks** and create a hook.
2. Use an external cron service (e.g. [cron-job.org](https://cron-job.org/)) to POST to the hook URL once daily.

Each triggered rebuild runs `prebuild`, pulling the latest data from DefiLlama before the Next.js build starts. If the API is unreachable, the build still succeeds using the last cached `data/generated/market-data.json` or static fallbacks from `data/coins.ts`.

## License

[MIT](LICENSE). Copyright (c) 2026 BlockRocket.