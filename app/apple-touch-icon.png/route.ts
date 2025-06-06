import { NextResponse } from "next/server"

export async function GET() {
  // Generate SVG icon
  const svg = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="180" height="180" fill="url(#grad)" rx="18"/>
    <text x="90" y="105" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="white" text-anchor="middle">PA</text>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
