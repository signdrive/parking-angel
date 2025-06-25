import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/server-utils"
import { APIError, handleAPIError } from "@/lib/api-error"
import type { Database } from "@/lib/types/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "500"

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
    }    if (parsedLng < -180 || parsedLng > 180) {
      throw new APIError("Invalid longitude: must be between -180 and 180", 400, "invalid_longitude")
    }

    const supabase = await getServerClient()

    // Find nearby spots using the RPC function
    const { data: spots, error: spotsError } = await supabase
      .rpc('find_nearby_real_spots', {
        lat: parsedLat,
        lng: parsedLng,
        radius: parsedRadius
      })

    if (spotsError) {
      throw new APIError("Failed to fetch nearby spots", 500, "spots_fetch_failed")
    }

    return NextResponse.json({
      spots: spots || [],
      center: { lat: parsedLat, lng: parsedLng },
      radius: parsedRadius
    })

  } catch (error) {
    return handleAPIError(error)
  }
}
