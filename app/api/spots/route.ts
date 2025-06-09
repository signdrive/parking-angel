import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-bulletproof"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "1000"
    const limit = searchParams.get("limit") || "50"

    console.log("🔍 Fetching parking spots with params:", { lat, lng, radius, limit })

    // Validate required parameters
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

    // Validate parameter values
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid latitude or longitude values",
          data: [],
        },
        { status: 400 },
      )
    }

    if (isNaN(radiusMeters) || radiusMeters < 0 || radiusMeters > 50000) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid radius (must be between 0 and 50000 meters)",
          data: [],
        },
        { status: 400 },
      )
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid limit (must be between 1 and 100)",
          data: [],
        },
        { status: 400 },
      )
    }

    let data, error

    // Try the new correctly typed function
    try {
      const result = await supabase.rpc("get_parking_spots_nearby", {
        user_lat: latitude,
        user_lng: longitude,
        radius_meters: radiusMeters,
        max_results: limitNum,
      })
      data = result.data
      error = result.error

      if (error) {
        console.log("Nearby function failed, trying simple function:", error)

        // Fallback to simple function
        const simpleResult = await supabase.rpc("get_available_parking_spots", {
          max_results: limitNum,
        })
        data = simpleResult.data
        error = simpleResult.error
      }
    } catch (funcError) {
      console.log("Function failed, using direct query:", funcError)
      error = funcError
    }

    if (error) {
      console.error("Database function error:", error)

      // Final fallback to direct table query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("parking_spots")
        .select(`
          id,
          latitude,
          longitude,
          address,
          spot_type,
          is_available,
          price_per_hour,
          max_duration_hours,
          total_spaces,
          available_spaces,
          restrictions,
          payment_methods,
          accessibility,
          covered,
          security,
          ev_charging,
          provider,
          confidence_score,
          expires_at,
          last_updated
        `)
        .eq("is_available", true)
        .limit(limitNum)

      if (fallbackError) {
        return NextResponse.json(
          {
            success: false,
            error: "Database query failed",
            details: fallbackError.message,
            data: [],
          },
          { status: 500 },
        )
      }

      data = fallbackData
    }

    // Process the data to ensure consistent types
    const processedData = data?.map((spot: any) => ({
      ...spot,
      latitude: Number(spot.latitude),
      longitude: Number(spot.longitude),
      // Ensure payment_methods is always an array
      payment_methods: Array.isArray(spot.payment_methods)
        ? spot.payment_methods
        : spot.payment_methods
          ? [spot.payment_methods]
          : [],
    }))

    return NextResponse.json({
      success: true,
      message: "Parking spots retrieved successfully",
      data: processedData || [],
      count: processedData?.length || 0,
      params: { lat: latitude, lng: longitude, radius: radiusMeters, limit: limitNum },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude, address, spot_type, reported_by, payment_methods } = body

    // Validate required fields
    if (!latitude || !longitude || !spot_type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: latitude, longitude, spot_type",
        },
        { status: 400 },
      )
    }

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid latitude or longitude values",
        },
        { status: 400 },
      )
    }

    const validSpotTypes = ["street", "garage", "lot", "meter", "private"]
    if (!validSpotTypes.includes(spot_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid spot_type. Must be one of: ${validSpotTypes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Create new parking spot with proper array handling
    const newSpot = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      latitude: lat,
      longitude: lng,
      address: address || "User reported location",
      spot_type,
      is_available: true,
      reported_by,
      confidence_score: 75,
      provider: "user_report",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      // Ensure payment_methods is an array
      payment_methods: Array.isArray(payment_methods) ? payment_methods : payment_methods ? [payment_methods] : null,
    }

    const { data, error } = await supabase.from("parking_spots").insert([newSpot]).select().single()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create parking spot",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Parking spot created successfully",
      data: {
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        payment_methods: Array.isArray(data.payment_methods)
          ? data.payment_methods
          : data.payment_methods
            ? [data.payment_methods]
            : [],
      },
    })
  } catch (error) {
    console.error("POST API error:", error)
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
