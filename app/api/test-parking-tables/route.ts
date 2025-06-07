import { createClient } from "@/lib/supabase-bulletproof"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Test query for parking_spots
    const { data: spots, error: spotsError } = await supabase.from("parking_spots").select("*").limit(5)

    if (spotsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error querying parking_spots",
          details: spotsError,
        },
        { status: 500 },
      )
    }

    // Test query for parking_usage_history
    const { data: history, error: historyError } = await supabase.from("parking_usage_history").select("*").limit(5)

    if (historyError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error querying parking_usage_history",
          details: historyError,
        },
        { status: 500 },
      )
    }

    // Test specific query format that was failing
    const testSpotId = spots && spots.length > 0 ? spots[0].id : "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54"

    const { data: spotDetails, error: spotDetailsError } = await supabase
      .from("parking_spots")
      .select("latitude,longitude,spot_type,address")
      .eq("id", testSpotId)
      .single()

    if (spotDetailsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error querying spot details",
          details: spotDetailsError,
        },
        { status: 500 },
      )
    }

    const { data: spotAvailability, error: spotAvailabilityError } = await supabase
      .from("parking_spots")
      .select("is_available,last_updated")
      .eq("id", testSpotId)
      .single()

    if (spotAvailabilityError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error querying spot availability",
          details: spotAvailabilityError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database tables are working correctly",
      data: {
        spots,
        history,
        spotDetails,
        spotAvailability,
      },
    })
  } catch (error) {
    console.error("Error testing parking tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error testing parking tables",
        details: error,
      },
      { status: 500 },
    )
  }
}
