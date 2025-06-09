import { type NextRequest, NextResponse } from "next/server"
import { ParkingService } from "@/lib/supabase-enhanced"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : undefined
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : undefined
    const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 5000
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    console.log("🔍 API: Fetching parking spots")

    // Validate parameters
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 })
    }

    if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 })
    }

    const result = await ParkingService.getNearbySpots({ lat, lng, radius, limit })

    if (result.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch parking spots",
          details: result.error,
          data: [],
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      data: result.data || [],
      count: result.data?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ API error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch parking spots",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
