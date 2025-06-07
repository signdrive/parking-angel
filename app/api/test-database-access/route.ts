import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("Testing database access...")

    // Test 1: Basic parking spots query
    const { data: allSpots, error: allSpotsError } = await supabase.from("parking_spots").select("*").limit(5)

    // Test 2: Specific spot query (one that was failing)
    const { data: specificSpot, error: specificError } = await supabase
      .from("parking_spots")
      .select("latitude, longitude, spot_type, address")
      .eq("id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .single()

    // Test 3: Availability query
    const { data: availability, error: availabilityError } = await supabase
      .from("parking_spots")
      .select("is_available, last_updated")
      .eq("id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .single()

    // Test 4: Usage history query
    const { data: usageHistory, error: historyError } = await supabase
      .from("parking_usage_history")
      .select("*")
      .eq("spot_id", "google_ChIJAZFO6X9Rw0cRPMnHnH_dm54")
      .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false })

    // Test 5: Count queries
    const { count: spotCount, error: countError } = await supabase
      .from("parking_spots")
      .select("*", { count: "exact", head: true })

    const { count: historyCount, error: historyCountError } = await supabase
      .from("parking_usage_history")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        allSpots: {
          success: !allSpotsError,
          count: allSpots?.length || 0,
          data: allSpots?.slice(0, 2), // Just show first 2
          error: allSpotsError,
        },
        specificSpot: {
          success: !specificError,
          data: specificSpot,
          error: specificError,
        },
        availability: {
          success: !availabilityError,
          data: availability,
          error: availabilityError,
        },
        usageHistory: {
          success: !historyError,
          count: usageHistory?.length || 0,
          data: usageHistory?.slice(0, 3), // Just show first 3
          error: historyError,
        },
        counts: {
          spots: {
            success: !countError,
            count: spotCount,
            error: countError,
          },
          history: {
            success: !historyCountError,
            count: historyCount,
            error: historyCountError,
          },
        },
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
