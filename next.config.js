
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove basePath and assetPrefix for standard deployment
  // Only use these for GitHub Pages static export
}

module.exports = nextConfig
