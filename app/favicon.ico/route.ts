import { NextResponse } from "next/server"

export async function GET() {
  // Generate a simple SVG favicon
  const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" fill="#3b82f6" rx="3"/>
    <text x="16" y="20" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">PA</text>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
