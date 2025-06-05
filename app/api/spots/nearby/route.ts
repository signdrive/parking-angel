import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "500"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const { data: spots, error } = await supabase.rpc("find_nearby_spots", {
      user_lat: Number.parseFloat(lat),
      user_lng: Number.parseFloat(lng),
      radius_meters: Number.parseInt(radius),
    })

    if (error) {
      console.error("Error fetching nearby spots:", error)
      return NextResponse.json({ error: "Failed to fetch nearby spots" }, { status: 500 })
    }

    return NextResponse.json({ spots: spots || [] })
  } catch (error) {
    console.error("Error in nearby spots API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
