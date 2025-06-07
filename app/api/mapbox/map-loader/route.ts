import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the token from server environment
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
    }

    // Return the token and map configuration
    return NextResponse.json({
      token: mapboxToken,
      config: {
        style: "mapbox://styles/mapbox/navigation-day-v1",
        defaultCenter: [-122.4194, 37.7749],
        defaultZoom: 16,
      },
    })
  } catch (error) {
    console.error("Error in map-loader API:", error)
    return NextResponse.json({ error: "Failed to load map configuration" }, { status: 500 })
  }
}
