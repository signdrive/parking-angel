import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use server-side environment variable (not NEXT_PUBLIC_)
    const mapboxToken = process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      console.error("Mapbox token not configured in environment variables")
      return NextResponse.json({ error: "Map service not configured" }, { status: 500 })
    }

    // Add security measures like rate limiting or authentication checks here
    // For example, check the referer to ensure requests come from your domain

    return NextResponse.json(
      { token: mapboxToken },
      {
        headers: {
          "Cache-Control": "private, max-age=3600", // Cache for 1 hour
        },
      },
    )
  } catch (error) {
    console.error("Error in Mapbox token endpoint:", error)
    return NextResponse.json({ error: "Failed to retrieve map configuration" }, { status: 500 })
  }
}
