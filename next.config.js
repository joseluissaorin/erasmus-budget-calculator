/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Only enable turbo in development
    turbo: process.env.NODE_ENV === 'development' ? {
      enabled: true,
    } : undefined,
  },
  // Port is set through the -p flag in package.json scripts
}

module.exports = nextConfig 