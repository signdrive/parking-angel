/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/icons-material']
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Optimize CSS loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        cacheGroups: {
          ...config.optimization?.splitChunks?.cacheGroups,
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };
    
    return config;
  },
  images: {
    domains: [
      'parkalgo.com',
      'www.parkalgo.com',
      'vzhvpecwnjssurxbyzph.supabase.co',
      'lh3.googleusercontent.com', // For Google profile pictures
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:",
              "connect-src 'self' https://api.mapbox.com https://overpass-api.de https://overpass-api.de/api/interpreter https://tile.openstreetmap.org https://supabase.co https://vzhvpecwnjssurxbyzph.supabase.co https://checkout.stripe.com https://maps.googleapis.com https://places.googleapis.com https://lh3.googleusercontent.com",
              "worker-src 'self' blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.stripe.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
              "img-src 'self' data: https: blob: https://lh3.googleusercontent.com",
              "font-src 'self' data: https:"
            ].join('; ')
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/www',
        destination: '/',
        permanent: true,
      },
      {
        source: '/auth/callback',
        has: [
          {
            type: 'query',
            key: 'error',
          },
        ],
        destination: '/auth/error?error=:error',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
