import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseInt(searchParams.get("radius") || "1000")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Latitude and longitude are required" }, { status: 400 })
    }

    console.log(`🔍 Fetching parking spots near ${lat}, ${lng} within ${radius}m`)

    try {
      // Try to fetch from database with timeout
      const { data, error } = (await Promise.race([
        supabase.from("parking_spots").select("*").limit(limit),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000)),
      ])) as any

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} spots from database`)
        return NextResponse.json({
          success: true,
          data: data,
          source: "database",
        })
      }
    } catch (dbError) {
      console.warn("Database unavailable, using fallback data:", dbError)
    }

    // Fallback to mock data
    console.log("🎭 Generating mock parking data")
    const mockData = generateMockParkingSpots(lat, lng, radius, limit)

    return NextResponse.json({
      success: true,
      data: mockData,
      source: "mock",
    })
  } catch (error) {
    console.error("API error:", error)

    // Always return some data, even if it's just mock data
    const lat = 37.7749 // Default SF coordinates
    const lng = -122.4194
    const mockData = generateMockParkingSpots(lat, lng, 1000, 20)

    return NextResponse.json({
      success: true,
      data: mockData,
      source: "fallback",
      warning: "Service temporarily unavailable, showing sample data",
    })
  }
}

function generateMockParkingSpots(lat: number, lng: number, radius: number, limit: number) {
  const spots = []
  const radiusInDegrees = radius / 111000

  for (let i = 0; i < limit; i++) {
    const angle = (Math.PI * 2 * i) / limit
    const distance = Math.random() * radiusInDegrees

    const spotLat = lat + distance * Math.cos(angle)
    const spotLng = lng + distance * Math.sin(angle)

    spots.push({
      id: `mock-${i}`,
      name: `Parking Spot ${i + 1}`,
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
