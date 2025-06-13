import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      console.error("Mapbox token not found in environment variables")
      return NextResponse.json(
        { 
          error: "Mapbox token not configured",
          message: "Please set NEXT_PUBLIC_MAPBOX_TOKEN or MAPBOX_ACCESS_TOKEN environment variable"
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ token: mapboxToken })
  } catch (error) {
    console.error("Error in mapbox token API:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to retrieve Mapbox token"
      }, 
      { status: 500 }
    )
  }
}
