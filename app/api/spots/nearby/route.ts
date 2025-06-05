import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "500"

    console.log("Nearby spots API called with:", { lat, lng, radius })

    if (!lat || !lng) {
      console.error("Missing lat/lng parameters")
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Validate coordinates
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)
    const radiusMeters = Number.parseInt(radius)

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      console.error("Invalid coordinate parameters:", { lat, lng, radius })
      return NextResponse.json({ error: "Invalid coordinate parameters" }, { status: 400 })
    }

    if (latitude < -90 || latitude > 90) {
      console.error("Invalid latitude:", latitude)
      return NextResponse.json({ error: "Invalid latitude: must be between -90 and 90" }, { status: 400 })
    }

    if (longitude < -180 || longitude > 180) {
      console.error("Invalid longitude:", longitude)
      return NextResponse.json({ error: "Invalid longitude: must be between -180 and 180" }, { status: 400 })
    }

    console.log("Calling find_nearby_spots with validated params:", { latitude, longitude, radiusMeters })

    const { data: spots, error } = await supabase.rpc("find_nearby_spots", {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: radiusMeters,
    })

    if (error) {
      console.error("Supabase RPC error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch nearby spots",
          details: error.message,
          spots: [], // Return empty array as fallback
        },
        { status: 200 },
      ) // Return 200 with empty spots instead of 500
    }

    console.log("Successfully fetched spots:", spots?.length || 0)
    return NextResponse.json({ spots: spots || [] })
  } catch (error) {
    console.error("Unexpected error in nearby spots API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        spots: [], // Return empty array as fallback
      },
      { status: 200 },
    ) // Return 200 with empty spots instead of 500
  }
}
