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
  // Configuration du proxy pour rediriger les requêtes API vers le backend
  async rewrites() {
    return [
      // Exclure explicitement les routes d'API admin
      {
        source: '/api/admin/validate-session',
        destination: '/api/admin/validate-session',
      },
      {
        source: '/api/admin/login',
        destination: '/api/admin/login',
      },
      {
        source: '/api/admin/logout',
        destination: '/api/admin/logout',
      },
      // Rediriger le reste des requêtes API vers le backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
  // Activer la minification SWC pour des builds plus rapides
  swcMinify: true,
  // Compression des assets pour améliorer les performances
  compress: true,
  // Optimisations pour la production
  productionBrowserSourceMaps: false, // Désactiver les source maps en production
  experimental: {
    // Optimisations expérimentales activées de manière sélective
    optimizeCss: true, // Optimiser les fichiers CSS
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      'tailwind-merge'
    ]
  },
  // Optimiser la taille des bundles
  webpack: (config, { dev, isServer }) => {
    // Ajouter des optimisations uniquement en production (non-dev)
    if (!dev) {
      // Utiliser Critters pour inliner les CSS critiques
      config.optimization.minimize = true;
      
      // Splitter les chunks pour améliorer le chargement
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000
      };
    }
    return config;
  },
}

module.exports = nextConfig