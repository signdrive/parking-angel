import { NextResponse } from "next/server"

export async function GET() {
  // Generate SVG icon
  const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="16" height="16" fill="url(#grad)" rx="2"/>
    <text x="8" y="11" font-family="Arial, sans-serif" font-size="4" font-weight="bold" fill="white" text-anchor="middle">PA</text>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
