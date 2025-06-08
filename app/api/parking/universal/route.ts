import { createClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")?.replace("eq.", "")
    const select = searchParams.get("select") || "latitude,longitude,spot_type,address,is_available"

    if (!spotId) {
      return NextResponse.json({ error: "Missing spot ID" }, { status: 400 })
    }

    const supabase = createClient()

    // Ensure spot exists and get data
    const { data: spotData, error: spotError } = await supabase.rpc("ensure_spot_exists", {
      spot_id_param: spotId,
    })

    if (spotError) {
      console.error("Spot creation error:", spotError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Parse requested fields
    const fields = select.split(",").map((f) => f.trim())
    const response: any = {}

    fields.forEach((field) => {
      switch (field) {
        case "latitude":
          response.latitude = spotData.latitude
          break
        case "longitude":
          response.longitude = spotData.longitude
          break
        case "spot_type":
          response.spot_type = spotData.spot_type
          break
        case "address":
          response.address = spotData.address
          break
        case "is_available":
          response.is_available = spotData.is_available
          break
        case "updated_at": // Changed from last_updated
          response.updated_at = spotData.updated_at
          break
        case "last_updated": // Support legacy requests
          response.last_updated = spotData.updated_at
          break
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Universal parking API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
