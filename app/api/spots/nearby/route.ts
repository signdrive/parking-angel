import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { APIError, handleAPIError } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "500"

    console.log("Nearby spots API called with:", { lat, lng, radius })

    if (!lat || !lng) {
      throw new APIError("Latitude and longitude are required", 400, "missing_coordinates")
    }

    // Validate coordinates
    const parsedLat = Number.parseFloat(lat)
    const parsedLng = Number.parseFloat(lng)
    const parsedRadius = Number.parseInt(radius)

    if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedRadius)) {
      throw new APIError("Invalid coordinate parameters", 400, "invalid_coordinates")
    }

    if (parsedLat < -90 || parsedLat > 90) {
      throw new APIError("Invalid latitude: must be between -90 and 90", 400, "invalid_latitude")
    }

    if (parsedLng < -180 || parsedLng > 180) {
      throw new APIError("Invalid longitude: must be between -180 and 180", 400, "invalid_longitude")
    }

    console.log("Calling find_nearby_spots with validated params:", { parsedLat, parsedLng, parsedRadius })

    const { data: spots, error } = await supabase.rpc("find_nearby_spots", {
      user_lat: parsedLat,
      user_lng: parsedLng,
      radius_meters: parsedRadius,
    })

    if (error) {
      console.error("Supabase RPC error:", error)
      throw new APIError("Failed to fetch nearby spots", 500, "database_error")
    }

    return NextResponse.json({
      spots,
      msg: "Successfully fetched nearby spots",
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
