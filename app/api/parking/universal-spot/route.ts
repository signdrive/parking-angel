import { createClient } from "@/lib/supabase-bulletproof"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")
    const fields = searchParams.get("select") || "latitude,longitude,spot_type,address,is_available,last_updated"

    if (!spotId) {
      return NextResponse.json(
        {
          error: "Missing spot ID",
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Use the get_or_create_spot function to handle any spot ID
    const { data, error } = await supabase.rpc("get_or_create_spot", {
      spot_id_param: spotId,
    })

    if (error) {
      console.error("Error in universal spot API:", error)
      return NextResponse.json(
        {
          error: "Database error",
          details: error,
        },
        { status: 500 },
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "Spot not found",
        },
        { status: 404 },
      )
    }

    const spot = data[0]

    // Filter fields based on the select parameter
    const filteredSpot: any = {}
    const requestedFields = fields.split(",")

    requestedFields.forEach((field) => {
      const cleanField = field.trim()
      if (cleanField === "last_updated") {
        filteredSpot.last_updated = spot.last_updated
      } else if (spot.hasOwnProperty(cleanField)) {
        filteredSpot[cleanField] = spot[cleanField]
      }
    })

    return NextResponse.json(filteredSpot)
  } catch (error) {
    console.error("Error in universal spot API:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error,
      },
      { status: 500 },
    )
  }
}
