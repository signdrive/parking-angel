import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test database connection and functions
    const tests = []

    // Test 1: Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_type", "BASE TABLE")

    tests.push({
      name: "Tables Check",
      success: !tablesError,
      data: tables?.map((t) => t.table_name) || [],
      error: tablesError?.message,
    })

    // Test 2: Test find_nearby_spots function
    const { data: nearbySpots, error: spotsError } = await supabase.rpc("find_nearby_spots", {
      user_lat: 37.7749,
      user_lng: -122.4194,
      radius_meters: 1000,
    })

    tests.push({
      name: "Find Nearby Spots Function",
      success: !spotsError,
      data: nearbySpots || [],
      error: spotsError?.message,
    })

    // Test 3: Test calculate_parking_demand function
    const { data: demand, error: demandError } = await supabase.rpc("calculate_parking_demand", {
      center_lat: 37.7749,
      center_lng: -122.4194,
      radius_meters: 1000,
    })

    tests.push({
      name: "Calculate Parking Demand Function",
      success: !demandError,
      data: demand || [],
      error: demandError?.message,
    })

    // Test 4: Check AI predictions
    const { data: predictions, error: predictionsError } = await supabase.from("ai_predictions").select("*").limit(5)

    tests.push({
      name: "AI Predictions Table",
      success: !predictionsError,
      data: predictions || [],
      error: predictionsError?.message,
    })

    // Test 5: Test cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc("cleanup_expired_spots")

    tests.push({
      name: "Cleanup Function",
      success: !cleanupError,
      data: { deleted_count: cleanupResult },
      error: cleanupError?.message,
    })

    const allTestsPassed = tests.every((test) => test.success)

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? "All database tests passed!" : "Some tests failed",
      tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
