import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Mapbox token is available (without exposing it)
    const hasMapboxToken = !!process.env.MAPBOX_ACCESS_TOKEN

    return NextResponse.json({
      available: hasMapboxToken,
      config: {
        style: "mapbox://styles/mapbox/navigation-day-v1",
        defaultCenter: [-122.4194, 37.7749],
        defaultZoom: 16,
        attribution: false,
        // Use our secure tile proxy
        tileProxy: "/api/mapbox/tiles",
      },
    })
  } catch (error) {
    console.error("Error in secure config API:", error)
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 })
  }
}
