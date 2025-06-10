import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get user counts for different time periods
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Active users (last hour)
    const { data: activeUsers } = await supabase
      .from("profiles")
      .select("id")
      .gte("updated_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())

    // Total and available spots
    const { data: allSpots } = await supabase.from("parking_spots").select("id, is_available, price_per_hour")

    const availableSpots = allSpots?.filter((spot) => spot.is_available) || []

    // User growth calculations (mock data for now)
    const userGrowth = {
      daily: Math.floor(Math.random() * 20) - 5, // -5% to +15%
      weekly: Math.floor(Math.random() * 30) - 10, // -10% to +20%
      monthly: Math.floor(Math.random() * 50) - 15, // -15% to +35%
    }

    // Revenue calculations (mock data)
    const revenue = {
      today: Math.floor(Math.random() * 5000) + 1000,
      thisWeek: Math.floor(Math.random() * 25000) + 5000,
      thisMonth: Math.floor(Math.random() * 100000) + 20000,
    }

    // Spot utilization
    const spotUtilization = allSpots?.length
      ? Math.round(((allSpots.length - availableSpots.length) / allSpots.length) * 100)
      : 0

    // Top locations (mock data)
    const topLocations = [
      { name: "Downtown District", searches: 1234 },
      { name: "Business Center", searches: 987 },
      { name: "Shopping Mall", searches: 756 },
      { name: "University Area", searches: 543 },
      { name: "Airport Terminal", searches: 432 },
    ]

    const analytics = {
      activeUsers: activeUsers?.length || 0,
      totalSpots: allSpots?.length || 0,
      availableSpots: availableSpots.length,
      revenue,
      userGrowth,
      spotUtilization,
      averageSessionTime: "12m 34s",
      topLocations,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        activeUsers: 0,
        totalSpots: 0,
        availableSpots: 0,
        revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
        userGrowth: { daily: 0, weekly: 0, monthly: 0 },
        spotUtilization: 0,
        averageSessionTime: "0m",
        topLocations: [],
      },
      { status: 500 },
    )
  }
}
