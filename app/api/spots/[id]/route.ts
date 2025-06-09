import { type NextRequest, NextResponse } from "next/server"
import { ParkingService } from "@/lib/supabase-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Missing parking spot ID" }, { status: 400 })
    }

    console.log("🔍 API: Getting parking spot by ID:", id)

    const result = await ParkingService.getSpotById(id)

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
      source: result.partial ? "partial_data" : "database",
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
