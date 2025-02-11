/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Ensure SWC is used
  swcMinify: true,
  experimental: {
    // Disable any experimental features
    optimizeCss: false,
    optimizePackageImports: [],
  },
}

module.exports = nextConfig