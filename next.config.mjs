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
    optimizePackageImports: ['@mui/icons-material'],
    optimizeCss: true
  },
  
  // Configure webpack for production optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize CSS chunks
      if (config.optimization) {
        config.optimization.splitChunks = {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
              priority: 10,
            },
          },
        };
      }
    }
    return config;
  },

  // Configure resource loading
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  async headers() {
    const googleAnalyticsDomains = [
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      'https://stats.g.doubleclick.net',
      'https://analytics.google.com',
      'https://region1.analytics.google.com',
      'https://www.google.be',
      'https://*.google.be',
      'https://*.google.com',
      'https://google.com'
    ];

    const isDev = process.env.NODE_ENV === 'development';
    const devDomains = isDev ? [
      'http://localhost:*',
      'https://localhost:*',
      'https://*.app.github.dev',
      'https://github.dev'
    ] : [];

    const cspDirectives = {
      'default-src': ["'self'", 'https://*.parkalgo.com', 'https://parkalgo.com', ...devDomains],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://*.parkalgo.com',
        'https://parkalgo.com',
        ...devDomains,
        ...googleAnalyticsDomains,
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://maps.googleapis.com',
        'https://apis.google.com',
        'https://accounts.google.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://*.parkalgo.com',
        'https://parkalgo.com',
        ...devDomains,
        'https://api.mapbox.com',
        'https://checkout.stripe.com',
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://*.parkalgo.com',
        'https://parkalgo.com',
        ...devDomains,
        ...googleAnalyticsDomains,
        'https://*.googleusercontent.com',
        'https://*.stripe.com',
        'https://*.google.com',
        'https://google.com'
      ],
      'connect-src': [
        "'self'",
        'https://*.parkalgo.com',
        'https://parkalgo.com',
        ...devDomains,
        ...googleAnalyticsDomains,
        'https://js.stripe.com',
        'https://api.stripe.com',
        'https://checkout.stripe.com',
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://api.mapbox.com',
        'https://overpass-api.de',
        'https://tile.openstreetmap.org',
        'https://maps.googleapis.com',
        'https://places.googleapis.com',
        'https://*.googleapis.com',
        'https://lh3.googleusercontent.com'
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://*.parkalgo.com',
        'https://parkalgo.com',
        ...devDomains,
        'https://checkout.stripe.com',
        'https://fonts.gstatic.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': [
        "'self'",
        'https://checkout.stripe.com',
        'https://accounts.google.com'
      ],
      'frame-ancestors': ["'none'"],
      'frame-src': [
        "'self'",
        'https://checkout.stripe.com',
        'https://*.stripe.com',
        'https://accounts.google.com',
        ...devDomains
      ],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'", 'data:', 'blob:', ...devDomains]
    };

    const csp = Object.entries(cspDirectives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');

    return [
      // Headers for all routes
      {
        source: '/:path*',
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: csp
          }
        ],
      },
      // Special headers for favicon and static assets
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      // Headers for other icons and static assets
      {
        source: '/(favicon-.*|icon-.*|apple-touch-icon.*)\.(png|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Handle www to non-www redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.parkalgo.com',
          },
        ],
        destination: 'https://parkalgo.com/:path*',
        permanent: true,
      },
      // Handle trailing slashes
      {
        source: '/:path((?!.*\\.).*)',
        has: [
          {
            type: 'header',
            key: 'x-pathname',
            value: '(?<pathname>.*?)/$',
          },
        ],
        destination: '/:pathname',
        permanent: true,
      },
      // Original redirects
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

  env: {
    GA4_API_SECRET: process.env.GA4_API_SECRET,
  },
}

export default nextConfig
