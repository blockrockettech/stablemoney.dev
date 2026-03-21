# StablecoinRef

Technical reference site for engineers and DeFi developers: the top stablecoins by market cap, with networks, contracts, features, and risk notes. Data is **static** (no live prices or oracles in v1).

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

| Command                | Description           |
| ---------------------- | --------------------- |
| `npm run dev`          | Development server    |
| `npm run build`        | Production build      |
| `npm run start`        | Run production server |
| `npm run lint`         | ESLint                |
| `npm run format`       | Prettier write        |
| `npm run format:check` | Prettier check        |

## Project layout

- `app/` — Routes: home, `/coins/[symbol]`, `/chains/[chain]`, `/compare`, `sitemap.ts`, `robots.ts`
- `components/` — UI: cards, filters, search, compare matrix, tables
- `data/coins.ts` — Typed coin dataset
- `content/coins/*.mdx` — Optional MDX sections on coin pages
- `lib/` — Search (Fuse), explorers, chains helpers

## Environment

Copy `.env.example` to `.env.local`. For correct canonical URLs in `metadataBase`, sitemap, and robots, set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

V1 does not require API keys.

## Deploy

Build with `npm run build` and run with `npm run start` on any Node host, or use your platform’s Next.js integration. Set `NEXT_PUBLIC_SITE_URL` to your public origin so Open Graph, `sitemap.xml`, and `robots.txt` use the right URLs.

## License

Private / your terms — adjust as needed.
