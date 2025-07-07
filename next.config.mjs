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
    optimizeCss: true // Enable CSS optimization
  },
  async headers() {
    const googleAnalyticsDomains = [
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      'https://analytics.google.com',
      'https://region1.google-analytics.com',
      'https://region1.analytics.google.com', // Add region1 analytics
      'https://www.google-analytics.com',
      'https://ssl.google-analytics.com',
      'https://stats.g.doubleclick.net',
      'https://www.googletagmanager.com'
    ];

    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
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
        'https://api.mapbox.com',
        'https://checkout.stripe.com',
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        ...googleAnalyticsDomains,
        'https://*.googleusercontent.com',
        'https://*.stripe.com'
      ],
      'connect-src': [
        "'self'",
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
        'https://accounts.google.com'
      ],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'"],
      'report-uri': ["'self'"] // Add CSP reporting
    };

    // Build CSP string from directives
    const csp = Object.entries(cspDirectives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');

    return [
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
  env: {
    GA4_API_SECRET: process.env.GA4_API_SECRET,
  },
}

export default nextConfig
