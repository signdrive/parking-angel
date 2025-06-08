import { createClient } from "@/lib/supabase-bulletproof"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")

    if (!spotId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing spot ID",
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Use the view instead of direct table access
    const { data: spotDetails, error: spotDetailsError } = await supabase
      .from("parking_spots_view")
      .select("latitude,longitude,spot_type,address")
      .eq("id", spotId)
      .single()

    if (spotDetailsError) {
      console.error("Error fetching spot details:", spotDetailsError)
      return NextResponse.json(
        {
          success: false,
          error: "Error fetching spot details",
          details: spotDetailsError,
        },
        { status: 500 },
      )
    }

    // Use the function for availability
    const { data: spotAvailability, error: spotAvailabilityError } = await supabase.rpc("get_spot_availability", {
      spot_id_param: spotId,
    })

    if (spotAvailabilityError) {
      console.error("Error fetching spot availability:", spotAvailabilityError)
      return NextResponse.json(
        {
          success: false,
          error: "Error fetching spot availability",
          details: spotAvailabilityError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      details: spotDetails,
      availability: spotAvailability[0],
    })
  } catch (error) {
    console.error("Error in spot details API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error processing request",
        details: error,
      },
      { status: 500 },
    )
  }
}
