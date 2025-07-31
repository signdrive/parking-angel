import { NextResponse } from 'next/server'

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /api/seo
Allow: /api/seo/
Allow: /sitemap.xml
Allow: /favicon.ico
Allow: /favicon-*.png
Allow: /icon-*.png
Allow: /icon-*.svg
Allow: /apple-touch-icon.png
Allow: /seo.html

# Disallow private and dynamic content (but explicitly allow SEO endpoints)
Disallow: /api/auth/
Disallow: /api/spots/
Disallow: /api/payments/
Disallow: /api/upload/
Disallow: /admin/
Disallow: /private/
Disallow: /auth/callback
Disallow: /dashboard/settings/

User-Agent: GPTBot
Disallow: /

User-Agent: Google-Extended
Disallow: /

Host: https://parkalgo.com
Sitemap: https://parkalgo.com/sitemap.xml
Sitemap: https://parkalgo.com/blog/sitemap.xml`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
