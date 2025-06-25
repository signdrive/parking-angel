import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/server-auth'
import { getServerClient } from '@/lib/supabase/server-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    const supabase = await getServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }    // Fetch actual data from existing tables
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString())

    const { data: parkingSpots } = await supabase
      .from('parking_spots')
      .select('id, created_at, updated_at')
      .gte('created_at', startDate.toISOString())

    // Calculate user metrics from actual data
    const totalUsers = profiles?.length || 0
    const newUsersThisPeriod = profiles?.length || 0
    
    // Mock revenue metrics (will be replaced with actual Stripe data later)
    const revenueMetrics = {
      totalRevenue: 25000,
      monthlyRecurring: 8500,
      averageRevenuePerUser: 12.99,
      conversionRate: 2.3
    }

    // Calculate usage metrics from actual data
    const usageMetrics = {
      totalSearches: parkingSpots?.length ? parkingSpots.length * 3 : 150, // Estimate based on spots
      spotsReported: parkingSpots?.length || 0,
      averageSessionTime: 8.5, // Mock data
      returnUserRate: 68.3 // Mock data
    }

    // Mock time series data (will be replaced with actual analytics)
    const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 100) + 50,
      searches: Math.floor(Math.random() * 500) + 200,
      spots: Math.floor(Math.random() * 50) + 10
    }))

    // Mock location data (will be replaced with actual geospatial analysis)
    const locationData = [
      { city: 'San Francisco', searches: 1250, spots: 340 },
      { city: 'Los Angeles', searches: 980, spots: 280 },
      { city: 'Seattle', searches: 650, spots: 180 },
      { city: 'Austin', searches: 420, spots: 120 }
    ]

    // Mock subscription data (will be replaced with actual subscription table)
    const subscriptionStats = {      basic: totalUsers > 0 ? Math.floor(totalUsers * 0.85) : 120,
      pro: totalUsers > 0 ? Math.floor(totalUsers * 0.12) : 18,
      elite: totalUsers > 0 ? Math.floor(totalUsers * 0.03) : 4
    }

    const formattedSubscriptionData = Object.entries(subscriptionStats).map(([tier, count]) => ({
      tier,
      count,
      revenue: tier === 'pro' ? count * 11.99 : tier === 'elite' ? count * 29.99 : 0
    }))

    const analytics = {
      userMetrics: {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.7), // Estimate 70% active
        newUsers: newUsersThisPeriod,
        churnRate: 4.2 // Mock churn rate
      },
      revenueMetrics,
      usageMetrics,
      locationData,
      timeSeriesData,
      subscriptionData: formattedSubscriptionData
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
