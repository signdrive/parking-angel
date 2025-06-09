import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "1000"
    const limit = searchParams.get("limit") || "50"

    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
          details: "Both 'lat' and 'lng' parameters are required",
        },
        { status: 400 },
      )
    }

    // Validate parameter formats
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)
    const radiusNum = Number.parseInt(radius)
    const limitNum = Number.parseInt(limit)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates",
          details: "Latitude and longitude must be valid numbers",
        },
        { status: 400 },
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Coordinates out of range",
          details: "Latitude must be between -90 and 90, longitude between -180 and 180",
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Try to fetch from database with error handling
    try {
      const { data, error } = await supabase.rpc("find_nearby_spots", {
        user_lat: latitude,
        user_lng: longitude,
        search_radius: radiusNum,
        max_results: limitNum,
      })

      if (error) {
        console.error("Supabase RPC error:", error)
        // Return mock data as fallback
        const mockData = generateMockSpots(latitude, longitude, limitNum)
        return NextResponse.json({
          success: true,
          data: mockData,
          source: "mock",
          message: "Using sample data - database function unavailable",
        })
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        source: "database",
        count: data?.length || 0,
      })
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      // Return mock data as fallback
      const mockData = generateMockSpots(latitude, longitude, limitNum)
      return NextResponse.json({
        success: true,
        data: mockData,
        source: "mock",
        message: "Using sample data - database unavailable",
      })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateMockSpots(lat: number, lng: number, limit: number) {
  const spots = []
  const radiusInDegrees = 0.01 // Roughly 1km

  for (let i = 0; i < Math.min(limit, 20); i++) {
    const angle = (Math.PI * 2 * i) / limit
    const distance = Math.random() * radiusInDegrees

    const spotLat = lat + distance * Math.cos(angle)
    const spotLng = lng + distance * Math.sin(angle)

    spots.push({
      id: `mock-${i}`,
      name: `Sample Parking ${i + 1}`,
      latitude: spotLat,
      longitude: spotLng,
      address: `${100 + i} Sample Street`,
      spot_type: ["garage", "street", "lot"][i % 3],
      provider: i % 2 === 0 ? "City Parking" : "Private Lot",
      is_available: Math.random() > 0.2,
      price_per_hour: i % 4 === 0 ? 0 : Math.floor(Math.random() * 15) + 5,
      real_time_data: i % 3 === 0,
      total_spaces: i % 3 === 0 ? Math.floor(Math.random() * 100) + 20 : null,
      available_spaces: i % 3 === 0 ? Math.floor(Math.random() * 30) : null,
    })
  }

  return spots
}
