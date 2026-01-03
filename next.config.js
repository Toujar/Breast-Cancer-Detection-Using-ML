
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  // output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/Breast-Cancer-Detection' : '',
  assetPrefix: isProd ? '/Breast-Cancer-Detection/' : '',
    eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
