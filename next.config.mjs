/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Report issues via `npm run lint` — do not fail `next build` on ESLint errors
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
