/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  // Remove output: 'export' if it's there
}

module.exports = nextConfig
