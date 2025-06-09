import { type NextRequest, NextResponse } from "next/server"
import { SupabaseQueryBuilder } from "@/lib/supabase-query-fix"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : undefined
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : undefined
    const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 5000
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    console.log("🔍 API: Getting parking spots with params:", { lat, lng, radius, limit })

    // Validate parameters
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      return NextResponse.json({ error: "Invalid latitude. Must be between -90 and 90." }, { status: 400 })
    }

    if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      return NextResponse.json({ error: "Invalid longitude. Must be between -180 and 180." }, { status: 400 })
    }

    if (isNaN(radius) || radius <= 0 || radius > 50000) {
      return NextResponse.json({ error: "Invalid radius. Must be between 1 and 50000 meters." }, { status: 400 })
    }

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return NextResponse.json({ error: "Invalid limit. Must be between 1 and 100." }, { status: 400 })
    }

    // Try the query builder
    let result = await SupabaseQueryBuilder.getParkingSpots({
      lat,
      lng,
      radius,
      limit,
    })

    // If that fails, try direct REST call
    if (result.error) {
      console.log("🔄 Falling back to direct REST call")
      const params: Record<string, string> = {
        select: "id,latitude,longitude,spot_type,address,is_available,provider,confidence_score,last_updated",
        is_available: "eq.true",
        order: "id",
        limit: limit.toString(),
      }

      result = await SupabaseQueryBuilder.directRestCall("parking_spots", params)
    }

    if (result.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch parking spots",
          details: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      data: result.data || [],
      count: result.data?.length || 0,
      source: "database",
      timestamp: new Date().toISOString(),
      params: { lat, lng, radius, limit },
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
