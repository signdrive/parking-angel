import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    name: "Parking Angel",
    short_name: "Parking Angel",
    description: "AI-Powered Parking Solutions",
    start_url: "/dashboard",
    display: "standalone",
    theme_color: "#3b82f6",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon-192x192.png",
        type: "image/svg+xml",
        sizes: "192x192",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        type: "image/svg+xml",
        sizes: "512x512",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Find Parking",
        short_name: "Find",
        description: "Find nearby parking spots",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
