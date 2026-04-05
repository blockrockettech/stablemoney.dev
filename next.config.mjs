/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/coins/frax",
        destination: "/coins/frxusd",
        permanent: true,
      }
    ]
  },
}

export default nextConfig
