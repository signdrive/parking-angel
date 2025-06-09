import { type NextRequest, NextResponse } from "next/server"
import { SupabaseCircuitBreaker } from "@/lib/supabase-circuit-breaker"
import { ParkingCache } from "@/lib/parking-cache"
import { getOfflineParkingSpots } from "@/lib/offline-parking-data"
import { resilientSupabase } from "@/lib/supabase-resilient"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "1000"
    const limit = searchParams.get("limit") || "50"

    console.log("🔍 Fetching parking spots:", { lat, lng, radius, limit })

    // Validate parameters
    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: lat and lng",
          data: [],
        },
        { status: 400 },
      )
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)
    const radiusMeters = Number.parseInt(radius)
    const limitNum = Number.parseInt(limit)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid latitude or longitude values",
          data: [],
        },
        { status: 400 },
      )
    }

    const cache = ParkingCache.getInstance()
    const circuitBreaker = SupabaseCircuitBreaker.getInstance()

    // Try cache first
    const cachedData = cache.get(latitude, longitude, radiusMeters)
    if (cachedData) {
      return NextResponse.json({
        success: true,
        message: "Parking spots retrieved from cache",
        data: cachedData.slice(0, limitNum),
        count: Math.min(cachedData.length, limitNum),
        source: "cache",
      })
    }

    // Use circuit breaker for database calls
    const data = await circuitBreaker.execute(
      async () => {
        console.log("🔄 Attempting database query...")
        const { data, error } = await resilientSupabase
          .from("parking_spots")
          .select(`
            id,
            latitude,
            longitude,
            address,
            spot_type,
            is_available,
            price_per_hour,
            provider,
            confidence_score,
            last_updated
          `)
          .eq("is_available", true)
          .limit(limitNum)

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        return data || []
      },
      () => {
        console.log("🆘 Using offline fallback data")
        return getOfflineParkingSpots(latitude, longitude, radiusMeters / 1000)
      },
    )

    // Cache successful results
    if (data && data.length > 0) {
      cache.set(latitude, longitude, radiusMeters, data)
    }

    const isOfflineData = data.some((spot: any) => spot.provider === "offline_data")

    return NextResponse.json({
      success: true,
      message: isOfflineData ? "Using offline data due to database issues" : "Parking spots retrieved successfully",
      data: data.slice(0, limitNum),
      count: Math.min(data.length, limitNum),
      source: isOfflineData ? "offline" : "database",
      circuitBreakerState: circuitBreaker.getState(),
    })
  } catch (error) {
    console.error("❌ API error:", error)

    // Emergency fallback
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")

    if (!isNaN(lat) && !isNaN(lng)) {
      const emergencyData = getOfflineParkingSpots(lat, lng, 10)

      return NextResponse.json({
        success: true,
        message: "Emergency offline mode activated",
        data: emergencyData,
        count: emergencyData.length,
        source: "emergency",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Service temporarily unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 503 },
    )
  }
}
