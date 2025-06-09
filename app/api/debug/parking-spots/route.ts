import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
    }

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from("parking_spots").select("count").limit(1)

      diagnostics.tests.push({
        name: "Basic Connection",
        success: !error,
        error: error?.message,
        data: data?.length || 0,
      })
    } catch (err) {
      diagnostics.tests.push({
        name: "Basic Connection",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 2: Table structure
    try {
      const { data, error } = await supabase
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, is_available")
        .limit(1)

      diagnostics.tests.push({
        name: "Table Structure",
        success: !error,
        error: error?.message,
        columns: data?.[0] ? Object.keys(data[0]) : [],
      })
    } catch (err) {
      diagnostics.tests.push({
        name: "Table Structure",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 3: Specific ID lookup
    const testIds = ["google_ChIJAZFO6X9Rw0cRPMnHnH_dm54", "osm_1180649490", "osm_223128866"]

    for (const testId of testIds) {
      try {
        const { data, error } = await supabase
          .from("parking_spots")
          .select("id, spot_type")
          .eq("id", testId)
          .maybeSingle()

        diagnostics.tests.push({
          name: `ID Lookup: ${testId}`,
          success: !error,
          found: !!data,
          error: error?.message,
          data,
        })
      } catch (err) {
        diagnostics.tests.push({
          name: `ID Lookup: ${testId}`,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    // Test 4: Count total records
    try {
      const { count, error } = await supabase.from("parking_spots").select("*", { count: "exact", head: true })

      diagnostics.tests.push({
        name: "Total Records Count",
        success: !error,
        count,
        error: error?.message,
      })
    } catch (err) {
      diagnostics.tests.push({
        name: "Total Records Count",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
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
