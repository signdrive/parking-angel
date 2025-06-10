import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get active users (users who have been active in the last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from("profiles")
      .select("id")
      .gte("updated_at", oneHourAgo)

    // Get total parking spots
    const { data: spotsData, error: spotsError } = await supabase.from("parking_spots").select("id, price_per_hour")

    // Calculate revenue (mock data for now)
    const revenue =
      spotsData?.reduce((total, spot) => {
        return total + (spot.price_per_hour || 0) * Math.random() * 10 // Mock usage
      }, 0) || 0

    const stats = {
      activeUsers: activeUsersData?.length || 0,
      totalSpots: spotsData?.length || 0,
      revenue: Math.round(revenue),
      systemHealth: "healthy",
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching real-time stats:", error)
    return NextResponse.json(
      {
        activeUsers: 0,
        totalSpots: 0,
        revenue: 0,
        systemHealth: "error",
      },
      { status: 500 },
    )
  }
}
