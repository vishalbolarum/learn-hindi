/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
      unoptimized: true,
      remotePatterns: [
          {
              protocol: 'https',
              hostname: 'cdn-icons-png.flaticon.com'
          },
          {
              protocol: 'https',
              hostname: 'flagcdn.com'
          }
      ]
  },
  experimental: {
      serverComponentsExternalPackages: ["knex"]
  }
}

module.exports = nextConfig
