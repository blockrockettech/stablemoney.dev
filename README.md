# StableMoney.Dev

Technical reference site for engineers and DeFi developers: the top stablecoins by market cap, with networks, contracts, features, and risk notes. **Market cap** (and total tracked cap) is refreshed at build time from [DefiLlama](https://defillama.com/). **Per-coin chain lists and counts** come from manually curated deployments in `data/coins.ts` (official / documented networks only — not every DefiLlama-indexed bridge variant). Live at [stablemoney.dev](https://stablemoney.dev).

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

| Command                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Development server                                   |
| `npm run build`        | Production build (runs `prebuild` automatically)     |
| `npm run prebuild`     | Fetch live market data from DefiLlama                |
| `npm run start`        | Run production server                                |
| `npm run lint`         | ESLint                                               |
| `npm run format`       | Prettier write                                       |
| `npm run format:check` | Prettier check                                       |

## Project layout

- `app/` — Routes: home, `/coins/[symbol]`, `/chains/[chain]`, `/compare`, `sitemap.ts`, `robots.ts`
- `components/` — UI: cards, filters, search, compare matrix, tables
- `data/coins.ts` — Typed coin dataset
- `content/coins/*.mdx` — Optional MDX sections on coin pages
- `lib/` — Search (Fuse), explorers, chains helpers

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

Private / your terms — adjust as needed.
