import { type NextRequest, NextResponse } from "next/server"
import { SupabaseQueryBuilder } from "@/lib/supabase-query-fix"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Missing parking spot ID" }, { status: 400 })
    }

    console.log("🔍 API: Getting parking spot by ID:", id)

    // Try the query builder first
    let result = await SupabaseQueryBuilder.getParkingSpotById(id)

    // If that fails, try direct REST call
    if (result.error) {
      console.log("🔄 Falling back to direct REST call")
      result = await SupabaseQueryBuilder.directRestCall("parking_spots", {
        select: "id,latitude,longitude,spot_type,address,is_available,last_updated",
        id: `eq.${id}`,
      })
    }

    if (result.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch parking spot",
          details: result.error,
        },
        { status: 500 },
      )
    }

    if (!result.data) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: result.data,
      source: "database",
      timestamp: new Date().toISOString(),
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
