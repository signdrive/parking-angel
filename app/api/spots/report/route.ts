import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude, spotType, address, notes } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const { data: spot, error: spotError } = await supabase
      .from("parking_spots")
      .insert({
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        spot_type: spotType || "street",
        address: address || null,
        reported_by: user.id,
        is_available: true,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (spotError) {
      console.error("Error creating parking spot:", spotError)
      return NextResponse.json({ error: "Failed to create parking spot" }, { status: 500 })
    }

    if (notes) {
      await supabase.from("spot_reports").insert({
        spot_id: spot.id,
        reporter_id: user.id,
        report_type: "available",
        notes,
      })
    }

    await supabase.rpc("update_user_reputation", {
      user_id: user.id,
      reputation_change: 5,
    })

    return NextResponse.json({ success: true, spot })
  } catch (error) {
    console.error("Error in spot report API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
