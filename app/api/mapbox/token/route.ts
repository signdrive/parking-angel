import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only use server-side environment variable (not NEXT_PUBLIC_)
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      console.error("Mapbox token not found in environment variables")
      return NextResponse.json(
        {
          error: "Mapbox token not configured",
          details: "Please set MAPBOX_ACCESS_TOKEN environment variable",
        },
        { status: 500 },
      )
    }

    // Validate token format (should start with 'pk.')
    if (!mapboxToken.startsWith("pk.")) {
      console.error("Invalid Mapbox token format")
      return NextResponse.json(
        {
          error: "Invalid Mapbox token format",
          details: "Mapbox token should start with 'pk.'",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      token: mapboxToken,
      success: true,
    })
  } catch (error) {
    console.error("Error in Mapbox token API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
