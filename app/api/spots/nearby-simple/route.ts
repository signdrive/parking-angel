import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "500"

    console.log("Simple nearby spots API called with:", { lat, lng, radius })

    // If no coordinates provided, return all spots
    if (!lat || !lng) {
      console.log("No coordinates provided, fetching all spots")

      const { data: spots, error } = await supabase.rpc("get_parking_spots_basic")

      if (error) {
        console.error("Error fetching basic spots:", error)
        return NextResponse.json({ spots: [], error: error.message })
      }

      console.log("Fetched basic spots:", spots?.length || 0)
      return NextResponse.json({ spots: spots || [] })
    }

    // Validate coordinates
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)
    const radiusMeters = Number.parseInt(radius)

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      console.error("Invalid coordinate parameters:", { lat, lng, radius })
      return NextResponse.json({ error: "Invalid coordinate parameters", spots: [] })
    }

    if (latitude < -90 || latitude > 90) {
      console.error("Invalid latitude:", latitude)
      return NextResponse.json({ error: "Invalid latitude: must be between -90 and 90", spots: [] })
    }

    if (longitude < -180 || longitude > 180) {
      console.error("Invalid longitude:", longitude)
      return NextResponse.json({ error: "Invalid longitude: must be between -180 and 180", spots: [] })
    }

    console.log("Calling find_nearby_spots_simple with validated params:", { latitude, longitude, radiusMeters })

    // Try the nearby function first
    const { data: nearbySpots, error: nearbyError } = await supabase.rpc("find_nearby_spots_simple", {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: radiusMeters,
    })

    if (nearbyError) {
      console.error("Nearby spots error, falling back to basic spots:", nearbyError)

      // Fallback to basic spots
      const { data: basicSpots, error: basicError } = await supabase.rpc("get_parking_spots_basic")

      if (basicError) {
        console.error("Basic spots error:", basicError)
        return NextResponse.json({ spots: [], error: basicError.message })
      }

      console.log("Fallback to basic spots successful:", basicSpots?.length || 0)
      return NextResponse.json({ spots: basicSpots || [], fallback: true })
    }

    console.log("Successfully fetched nearby spots:", nearbySpots?.length || 0)
    return NextResponse.json({ spots: nearbySpots || [] })
  } catch (error) {
    console.error("Unexpected error in simple nearby spots API:", error)
    return NextResponse.json({
      error: "Internal server error",
      spots: [],
    })
  }
}
