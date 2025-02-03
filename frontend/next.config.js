/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true // Force l'utilisation de SWC
  },
  compiler: {
    styledComponents: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      }
    ]
  }
}

module.exports = nextConfig 