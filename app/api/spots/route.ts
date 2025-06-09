import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : null
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : null
    const radius = Number.parseInt(searchParams.get("radius") || "1000")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log("API: Getting spots for", { lat, lng, radius, limit })

    let result

    if (lat && lng) {
      // Try the function first
      result = await supabase.rpc("get_nearby_spots_simple", {
        user_lat: lat,
        user_lng: lng,
        radius_meters: radius,
        max_results: limit,
      })

      // If function fails, fallback to simple query
      if (result.error) {
        console.log("Function failed, using fallback:", result.error)
        result = await supabase
          .from("parking_spots")
          .select("id, latitude, longitude, address, spot_type, is_available, price_per_hour, provider")
          .eq("is_available", true)
          .limit(limit)
      }
    } else {
      // Simple query without location
      result = await supabase
        .from("parking_spots")
        .select("id, latitude, longitude, address, spot_type, is_available, price_per_hour, provider")
        .eq("is_available", true)
        .limit(limit)
    }

    if (result.error) {
      console.error("Database error:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          data: [],
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 },
    )
  }
}
