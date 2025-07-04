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
        
                  // ...existing code...
                    {
                      key: 'Content-Security-Policy',
                      value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
                        "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com https://lh3.googleusercontent.com",
                        "font-src 'self' data:",
                        "object-src 'none'",
                        "base-uri 'self'",
                        "form-action 'self'",
                        "frame-ancestors 'none'",
                        "frame-src 'self' https://checkout.stripe.com https://*.stripe.com https://accounts.google.com",
                        "worker-src 'self' blob:",
                        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://overpass-api.de https://tile.openstreetmap.org https://maps.googleapis.com https://places.googleapis.com https://region1.google-analytics.com"
                      ].join('; ')
                    }
          // ...existing code...          // ...existing code...
                    {
                      key: 'Content-Security-Policy',
                      value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
                        "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com https://lh3.googleusercontent.com",
                        "font-src 'self' data:",
                        "object-src 'none'",
                        "base-uri 'self'",
                        "form-action 'self'",
                        "frame-ancestors 'none'",
                        "frame-src 'self' https://checkout.stripe.com https://*.stripe.com https://accounts.google.com",
                        "worker-src 'self' blob:",
                        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://overpass-api.de https://tile.openstreetmap.org https://maps.googleapis.com https://places.googleapis.com https://region1.google-analytics.com"
                      ].join('; ')
                    }
          // ...existing code...          // ...existing code...
                    {
                      key: 'Content-Security-Policy',
                      value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
                        "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
                        "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com https://lh3.googleusercontent.com",
                        "font-src 'self' data:",
                        "object-src 'none'",
                        "base-uri 'self'",
                        "form-action 'self'",
                        "frame-ancestors 'none'",
                        "frame-src 'self' https://checkout.stripe.com https://*.stripe.com https://accounts.google.com",
                        "worker-src 'self' blob:",
                        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://overpass-api.de https://tile.openstreetmap.org https://maps.googleapis.com https://places.googleapis.com https://region1.google-analytics.com"
                      ].join('; ')
                    }
          // ...existing code...  },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
              "script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://checkout.stripe.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
              "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com https://lh3.googleusercontent.com",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self' https://checkout.stripe.com https://*.stripe.com",
              "worker-src 'self' blob:",
              "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://overpass-api.de https://tile.openstreetmap.org https://maps.googleapis.com https://places.googleapis.com"
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
