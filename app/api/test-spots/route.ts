import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing parking spots data...")

    // Test 1: Check if table exists and has data
    const { data: tableData, error: tableError } = await supabase.from("parking_spots").select("*").limit(5)

    console.log("Direct table query result:", {
      data: tableData?.length || 0,
      error: tableError?.message,
    })

    // Test 2: Try basic function
    const { data: basicSpots, error: basicError } = await supabase.rpc("get_parking_spots_basic")

    console.log("Basic function result:", {
      data: basicSpots?.length || 0,
      error: basicError?.message,
    })

    // Test 3: Try nearby function with SF coordinates
    const { data: nearbySpots, error: nearbyError } = await supabase.rpc("find_nearby_spots_simple", {
      user_lat: 37.7749,
      user_lng: -122.4194,
      radius_meters: 5000,
    })

    console.log("Nearby function result:", {
      data: nearbySpots?.length || 0,
      error: nearbyError?.message,
    })

    return NextResponse.json({
      tests: {
        directTable: {
          success: !tableError,
          count: tableData?.length || 0,
          error: tableError?.message,
          sample: tableData?.[0],
        },
        basicFunction: {
          success: !basicError,
          count: basicSpots?.length || 0,
          error: basicError?.message,
          sample: basicSpots?.[0],
        },
        nearbyFunction: {
          success: !nearbyError,
          count: nearbySpots?.length || 0,
          error: nearbyError?.message,
          sample: nearbySpots?.[0],
        },
      },
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
