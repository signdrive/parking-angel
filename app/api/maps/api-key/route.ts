import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use server-side environment variable (not NEXT_PUBLIC_)
    const mapboxToken = process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
    }

    // Add security measures like rate limiting or authentication checks here
    // For example, check the referer to ensure requests come from your domain

    return NextResponse.json({ apiKey: mapboxToken })
  } catch (error) {
    console.error("Error in Mapbox API key endpoint:", error)
    return NextResponse.json({ error: "Failed to retrieve API key" }, { status: 500 })
  }
}
