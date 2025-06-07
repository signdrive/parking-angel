import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a single supabase client for the API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Test query 1: Get parking spot details
    const { data: spotDetails, error: spotError } = await supabase
      .from("parking_spots")
      .select("latitude, longitude, spot_type, address")
      .eq("id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .single()

    // Test query 2: Get availability status
    const { data: availabilityStatus, error: availabilityError } = await supabase
      .from("parking_spots")
      .select("is_available, last_updated")
      .eq("id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .single()

    // Test query 3: Get usage history
    const { data: usageHistory, error: historyError } = await supabase
      .from("parking_usage_history")
      .select("*")
      .eq("spot_id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false })

    // Count total spots
    const { count: spotCount, error: countError } = await supabase
      .from("parking_spots")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      tests: {
        spotDetails: {
          success: !spotError,
          data: spotDetails,
          error: spotError,
        },
        availabilityStatus: {
          success: !availabilityError,
          data: availabilityStatus,
          error: availabilityError,
        },
        usageHistory: {
          success: !historyError,
          data: usageHistory,
          error: historyError,
        },
        spotCount: {
          success: !countError,
          count: spotCount,
          error: countError,
        },
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
