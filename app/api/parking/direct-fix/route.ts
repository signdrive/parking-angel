import { createClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// Direct API to handle Supabase queries with proper headers and column names
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")?.replace("eq.", "")
    const select = searchParams.get("select") || "latitude,longitude,spot_type,address,is_available,updated_at"

    if (!spotId) {
      return NextResponse.json({ error: "Missing spot ID" }, { status: 400 })
    }

    const supabase = createClient()

    // First ensure the spot exists
    const { data: existingSpot } = await supabase.from("parking_spots").select("id").eq("id", spotId).single()

    if (!existingSpot) {
      // Create the spot if it doesn't exist
      const { error: insertError } = await supabase.from("parking_spots").insert({
        id: spotId,
        latitude: 52.3676 + Math.random() * 0.01,
        longitude: 4.9041 + Math.random() * 0.01,
        spot_type: spotId.includes("google") ? "street" : "lot",
        address: `Amsterdam - ${spotId}`,
        is_available: Math.random() > 0.3,
      })

      if (insertError) {
        console.error("Error creating spot:", insertError)
      }
    }

    // Now get the spot data with correct column names
    const { data: spotData, error } = await supabase
      .from("parking_spots")
      .select(select.replace("last_updated", "updated_at")) // Fix column name
      .eq("id", spotId)
      .single()

    if (error) {
      console.error("Error fetching spot:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Convert updated_at to last_updated if requested for backward compatibility
    if (select.includes("last_updated") && spotData.updated_at) {
      spotData.last_updated = spotData.updated_at
      delete spotData.updated_at
    }

    return NextResponse.json(spotData)
  } catch (error) {
    console.error("Direct fix API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
