import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : null
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : null
    const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 5000
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    console.log("Fetching spots near", { lat, lng, radius, limit })

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing lat/lng parameters",
          data: [],
        },
        { status: 400 },
      )
    }

    // Use the new function name
    let result = await supabase.rpc("get_spots_nearby", {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radius,
      max_results: limit,
    })

    // If function fails, fall back to direct query
    if (result.error) {
      console.error("Function error, falling back to direct query:", result.error)

      result = await supabase.from("parking_spots").select("*").eq("is_available", true).limit(limit)
    }

    if (result.error) {
      console.error("Database error:", result.error)
      // Return mock data as last resort
      return NextResponse.json({
        success: true,
        data: generateMockSpots(lat, lng, 10),
        source: "mock",
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      source: "database",
    })
  } catch (error) {
    console.error("API error:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: generateMockSpots(40.7128, -74.006, 5),
      source: "mock-error",
    })
  }
}

// Generate mock spots as a last resort
function generateMockSpots(lat: number, lng: number, count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    name: `Mock Parking Spot ${i + 1}`,
    latitude: lat + (Math.random() * 0.01 - 0.005),
    longitude: lng + (Math.random() * 0.01 - 0.005),
    address: `${i + 1} Mock Street`,
    spot_type: i % 3 === 0 ? "garage" : i % 3 === 1 ? "street" : "lot",
    is_available: true,
    price_per_hour: i % 4 === 0 ? 0 : i % 10,
    provider: i % 2 === 0 ? "MockParking" : "FallbackSpots",
    real_time_data: false,
    total_spaces: 10 + i,
    available_spaces: 5 + i,
    distance_meters: 100 + i * 50,
  }))
}
