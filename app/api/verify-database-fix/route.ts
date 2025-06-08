import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("Verifying database fix...")

    // Test all the problematic queries from the error log
    const problematicIds = [
      "google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko",
      "google_ChIJtXeV6cVQw0cRdqges2xroWo",
      "google_ChIJrwmAAeNRw0cRl9CBUSuhFnM",
      "google_ChIJ6eiLTOhQw0cRciypB-8i3mA",
      "google_ChIJ0wKH_V5Rw0cRRHoMsfQRvQg",
      "osm_229430300",
      "osm_274494286",
      "osm_312201375",
      "osm_374484319",
      "osm_374484330",
      "osm_586048352",
      "osm_589047127",
      "osm_589052000",
      "osm_589197917",
      "osm_591094619",
      "osm_694507240",
      "osm_696520424",
      "osm_1180426259",
      "osm_1180426263",
    ]

    const results = []

    for (const spotId of problematicIds.slice(0, 5)) {
      // Test first 5 to avoid timeout
      try {
        // Test 1: Basic spot info (was getting 406 errors)
        const { data: spotInfo, error: spotError } = await supabase
          .from("parking_spots")
          .select("latitude, longitude, spot_type, address")
          .eq("id", spotId)
          .single()

        // Test 2: Availability info (was getting 406 errors)
        const { data: availability, error: availError } = await supabase
          .from("parking_spots")
          .select("is_available, last_updated")
          .eq("id", spotId)
          .single()

        // Test 3: Usage history (was getting 400 errors)
        const { data: history, error: historyError } = await supabase
          .from("parking_usage_history")
          .select("*")
          .eq("spot_id", spotId)
          .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("timestamp", { ascending: false })

        results.push({
          spotId,
          spotInfo: {
            success: !spotError,
            data: spotInfo,
            error: spotError?.message,
          },
          availability: {
            success: !availError,
            data: availability,
            error: availError?.message,
          },
          history: {
            success: !historyError,
            count: history?.length || 0,
            data: history?.slice(0, 2), // Show first 2 records
            error: historyError?.message,
          },
        })
      } catch (error) {
        results.push({
          spotId,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Overall database health check
    const { count: totalSpots, error: countError } = await supabase
      .from("parking_spots")
      .select("*", { count: "exact", head: true })

    const { count: totalHistory, error: historyCountError } = await supabase
      .from("parking_usage_history")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalSpots: totalSpots || 0,
        totalHistory: totalHistory || 0,
        spotsError: countError?.message,
        historyError: historyCountError?.message,
      },
      testResults: results,
      message: "Database fix verification complete",
    })
  } catch (error) {
    console.error("Database verification error:", error)
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
