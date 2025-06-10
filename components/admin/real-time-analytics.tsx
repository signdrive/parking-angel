"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, MapPin, DollarSign, TrendingUp } from "lucide-react"

interface AnalyticsData {
  activeUsers: number
  totalSpots: number
  availableSpots: number
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  userGrowth: {
    daily: number
    weekly: number
    monthly: number
  }
  spotUtilization: number
  averageSessionTime: string
  topLocations: Array<{
    name: string
    searches: number
  }>
}

export function RealTimeAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    activeUsers: 0,
    totalSpots: 0,
    availableSpots: 0,
    revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
    userGrowth: { daily: 0, weekly: 0, monthly: 0 },
    spotUtilization: 0,
    averageSessionTime: "0m",
    topLocations: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics")
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    // Update every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={data.userGrowth.daily >= 0 ? "text-green-600" : "text-red-600"}>
                {data.userGrowth.daily >= 0 ? "+" : ""}
                {data.userGrowth.daily}%
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.availableSpots.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {data.totalSpots.toLocaleString()} total spots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.revenue.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">${data.revenue.thisMonth.toLocaleString()} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spot Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.spotUtilization}%</div>
            <p className="text-xs text-muted-foreground">Average session: {data.averageSessionTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
            <CardDescription>User registration and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Growth</span>
                <Badge variant={data.userGrowth.daily >= 0 ? "default" : "destructive"}>
                  {data.userGrowth.daily >= 0 ? "+" : ""}
                  {data.userGrowth.daily}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Growth</span>
                <Badge variant={data.userGrowth.weekly >= 0 ? "default" : "destructive"}>
                  {data.userGrowth.weekly >= 0 ? "+" : ""}
                  {data.userGrowth.weekly}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Growth</span>
                <Badge variant={data.userGrowth.monthly >= 0 ? "default" : "destructive"}>
                  {data.userGrowth.monthly >= 0 ? "+" : ""}
                  {data.userGrowth.monthly}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Locations</CardTitle>
            <CardDescription>Most searched parking areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topLocations.length > 0 ? (
                data.topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{location.name}</span>
                    <span className="text-sm text-gray-600">{location.searches.toLocaleString()} searches</span>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Downtown District</span>
                    <span className="text-sm text-gray-600">1,234 searches</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Business Center</span>
                    <span className="text-sm text-gray-600">987 searches</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Shopping Mall</span>
                    <span className="text-sm text-gray-600">756 searches</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">University Area</span>
                    <span className="text-sm text-gray-600">543 searches</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Real-time system metrics and health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">142ms</p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{data.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">94.2%</p>
              <p className="text-sm text-gray-600">Cache Hit Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
