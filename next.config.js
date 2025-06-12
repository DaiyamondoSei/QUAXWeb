/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
  },
  images: {
    domains: ['i.imgur.com', 'imgur.com'],
  },
}

module.exports = nextConfig 