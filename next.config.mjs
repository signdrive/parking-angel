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
    optimizePackageImports: ['@mui/icons-material']
  },
  async headers() {
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com https://apis.google.com",
              "script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://checkout.stripe.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com https://*.googleusercontent.com https://*.stripe.com",
              "font-src 'self' data: https://checkout.stripe.com https://fonts.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com https://accounts.google.com",
              "frame-ancestors 'none'",
              "frame-src 'self' https://checkout.stripe.com https://*.stripe.com https://accounts.google.com",
              "worker-src 'self' blob:",
              "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://region1.google-analytics.com https://api.stripe.com https://*.stripe.com https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://overpass-api.de https://tile.openstreetmap.org https://maps.googleapis.com https://places.googleapis.com https://*.googleapis.com https://lh3.googleusercontent.com"
            ].join('; ')
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
}

export default nextConfig
