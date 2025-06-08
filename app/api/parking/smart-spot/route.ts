import { createClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")?.replace("eq.", "")
    const select = searchParams.get("select") || "latitude,longitude,spot_type,address,is_available,updated_at"

    if (!spotId) {
      return NextResponse.json({ error: "Missing spot ID" }, { status: 400 })
    }

    const supabase = createClient()

    // First try to get real coordinates
    let realCoordinates = null
    try {
      const coordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/parking/get-real-coordinates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      })

      if (coordResponse.ok) {
        realCoordinates = await coordResponse.json()
      }
    } catch (error) {
      console.log("Could not fetch real coordinates, using fallback")
    }

    // Check if spot exists
    const { data: existingSpot } = await supabase.from("parking_spots").select("*").eq("id", spotId).single()

    if (!existingSpot) {
      // Create spot with real coordinates if available
      const spotData = {
        id: spotId,
        latitude: realCoordinates?.latitude || 52.3676 + (Math.random() - 0.5) * 0.01,
        longitude: realCoordinates?.longitude || 4.9041 + (Math.random() - 0.5) * 0.01,
        spot_type: spotId.includes("google") ? "street" : "lot",
        address: realCoordinates?.address || `Amsterdam - ${spotId}`,
        is_available: Math.random() > 0.3,
      }

      const { error: insertError } = await supabase.from("parking_spots").insert(spotData)

      if (insertError) {
        console.error("Error creating spot:", insertError)
        return NextResponse.json({ error: "Could not create spot" }, { status: 500 })
      }
    }

    // Get the spot data
    const { data: spotData, error } = await supabase
      .from("parking_spots")
      .select(select.replace("last_updated", "updated_at"))
      .eq("id", spotId)
      .single()

    if (error) {
      console.error("Error fetching spot:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle backward compatibility
    if (select.includes("last_updated") && spotData.updated_at) {
      spotData.last_updated = spotData.updated_at
      delete spotData.updated_at
    }

    return NextResponse.json(spotData)
  } catch (error) {
    console.error("Smart spot API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
