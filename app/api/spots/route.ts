import { type NextRequest, NextResponse } from "next/server"
import { getParkingSpotsResilient } from "@/lib/supabase-resilient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "1000"
    const limit = searchParams.get("limit") || "50"

    console.log("🔍 Fetching parking spots with resilient query:", { lat, lng, radius, limit })

    const latitude = lat ? Number.parseFloat(lat) : undefined
    const longitude = lng ? Number.parseFloat(lng) : undefined
    const radiusMeters = Number.parseInt(radius)
    const limitNum = Number.parseInt(limit)

    // Validate parameters if provided
    if (lat && lng) {
      if (
        isNaN(latitude!) ||
        isNaN(longitude!) ||
        latitude! < -90 ||
        latitude! > 90 ||
        longitude! < -180 ||
        longitude! > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid latitude or longitude values",
            data: [],
          },
          { status: 400 },
        )
      }
    }

    // Use resilient query with automatic fallback
    const { data, error, fromFallback } = await getParkingSpotsResilient({
      lat: latitude,
      lng: longitude,
      radius: radiusMeters,
      limit: limitNum,
    })

    if (error && !fromFallback) {
      return NextResponse.json(
        {
          success: false,
          error: "Database temporarily unavailable",
          details: error.message,
          data: [],
          suggestion: "Please try again in a few moments",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      success: true,
      message: fromFallback ? "Using fallback data due to database issues" : "Parking spots retrieved successfully",
      data: data || [],
      count: data?.length || 0,
      fallback: fromFallback || false,
      params: { lat: latitude, lng: longitude, radius: radiusMeters, limit: limitNum },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Service temporarily unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 503 },
    )
  }
}
