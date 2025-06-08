import { createClient } from "@/lib/supabase-bulletproof"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Test the get_spot_details function
    const { data: spotDetails, error: spotDetailsError } = await supabase.rpc("get_spot_details", {
      spot_id_param: "google_ChIJRy77kq5Rw0cR56z6UkSoOC8",
    })

    if (spotDetailsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error getting spot details",
          details: spotDetailsError,
        },
        { status: 500 },
      )
    }

    // Test the get_spot_usage_history function
    const { data: usageHistory, error: usageHistoryError } = await supabase.rpc("get_spot_usage_history", {
      spot_id_param: "google_ChIJRy77kq5Rw0cR56z6UkSoOC8",
      timestamp_param: "Sun Mar 09 2025 22:23:20 GMT+0100 (Midden-Europese standaardtijd)",
    })

    if (usageHistoryError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error getting usage history",
          details: usageHistoryError,
        },
        { status: 500 },
      )
    }

    // Test direct queries that were failing
    const { data: spotLatLng, error: spotLatLngError } = await supabase
      .from("parking_spots")
      .select("latitude,longitude,spot_type,address")
      .eq("id", "google_ChIJRy77kq5Rw0cR56z6UkSoOC8")
      .single()

    if (spotLatLngError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error getting spot lat/lng",
          details: spotLatLngError,
        },
        { status: 500 },
      )
    }

    const { data: spotAvailability, error: spotAvailabilityError } = await supabase
      .from("parking_spots")
      .select("is_available,updated_at")
      .eq("id", "google_ChIJRy77kq5Rw0cR56z6UkSoOC8")
      .single()

    if (spotAvailabilityError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error getting spot availability",
          details: spotAvailabilityError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "All parking queries are working correctly",
      data: {
        spotDetails,
        usageHistory,
        spotLatLng,
        spotAvailability,
      },
    })
  } catch (error) {
    console.error("Error testing parking queries:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error testing parking queries",
        details: error,
      },
      { status: 500 },
    )
  }
}
