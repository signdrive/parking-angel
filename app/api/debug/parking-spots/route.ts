import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-bulletproof"

export async function GET() {
  try {
    console.log("🔍 Starting parking spots diagnostics...")

    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        total: 0,
      },
    }

    // Test 1: Table Structure Check
    try {
      const { data, error, count } = await supabase.from("parking_spots").select("*").limit(1)

      diagnostics.tests.push({
        name: "Table Structure Check",
        description: "Verify parking_spots table exists and check its structure",
        success: !error,
        data: error ? null : { data, error, count },
        error: error?.message,
      })

      if (!error) diagnostics.summary.passed++
      else diagnostics.summary.failed++
    } catch (err) {
      diagnostics.tests.push({
        name: "Table Structure Check",
        description: "Verify parking_spots table exists and check its structure",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    // Test 2: Count All Parking Spots
    try {
      const { count, error } = await supabase.from("parking_spots").select("*", { count: "exact", head: true })

      diagnostics.tests.push({
        name: "Count All Parking Spots",
        description: "Get total count of parking spots",
        success: !error,
        data: { count, error },
        error: error?.message,
      })

      if (!error) diagnostics.summary.passed++
      else diagnostics.summary.failed++
    } catch (err) {
      diagnostics.tests.push({
        name: "Count All Parking Spots",
        description: "Get total count of parking spots",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    // Test 3: Sample Parking Spots
    try {
      const { data, error, count } = await supabase
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available")
        .limit(5)

      diagnostics.tests.push({
        name: "Sample Parking Spots",
        description: "Fetch first 5 parking spots",
        success: !error,
        data: { data, error, count },
        error: error?.message,
      })

      if (!error) diagnostics.summary.passed++
      else diagnostics.summary.failed++
    } catch (err) {
      diagnostics.tests.push({
        name: "Sample Parking Spots",
        description: "Fetch first 5 parking spots",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    // Test 4: Check Specific ID Format
    try {
      const testIds = ["google_ChIJAZFO6X9Rw0cRPMnHnH_dm54", "osm_1180649490", "osm_223128866"]
      const results = []

      for (const id of testIds) {
        const { data, error } = await supabase.from("parking_spots").select("id").eq("id", id).maybeSingle()

        results.push({
          id,
          exists: !error && !!data,
        })
      }

      diagnostics.tests.push({
        name: "Check Specific ID Format",
        description: "Test if the failing IDs exist in database",
        success: true,
        data: { results },
      })

      diagnostics.summary.passed++
    } catch (err) {
      diagnostics.tests.push({
        name: "Check Specific ID Format",
        description: "Test if the failing IDs exist in database",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    // Test 5: RLS Policy Check
    try {
      const { data, error } = await supabase.from("parking_spots").select("count").limit(1)

      diagnostics.tests.push({
        name: "RLS Policy Check",
        description: "Test if Row Level Security is blocking queries",
        success: !error,
        data: {
          publicAccess: !error,
          publicData: data?.length || 0,
        },
        error: error?.message,
      })

      if (!error) diagnostics.summary.passed++
      else diagnostics.summary.failed++
    } catch (err) {
      diagnostics.tests.push({
        name: "RLS Policy Check",
        description: "Test if Row Level Security is blocking queries",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    // Test 6: Database Connection Test
    try {
      const { error } = await supabase.from("parking_spots").select("id").limit(1)

      diagnostics.tests.push({
        name: "Database Connection Test",
        description: "Test basic database connectivity",
        success: !error,
        data: { connected: !error },
        error: error?.message,
      })

      if (!error) diagnostics.summary.passed++
      else diagnostics.summary.failed++
    } catch (err) {
      diagnostics.tests.push({
        name: "Database Connection Test",
        description: "Test basic database connectivity",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
      diagnostics.summary.failed++
    }

    diagnostics.summary.total = diagnostics.tests.length

    return NextResponse.json({
      success: diagnostics.summary.failed === 0,
      message: `Diagnostics completed: ${diagnostics.summary.passed}/${diagnostics.summary.total} tests passed`,
      diagnostics,
    })
  } catch (error) {
    console.error("Diagnostics failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Diagnostics failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
