"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, MapPin, Users, Clock, RefreshCw, Download } from "lucide-react"

interface LocationPoint {
  latitude: number
  longitude: number
  user_count: number
  timestamp: string
}

export function LocationHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [locationData, setLocationData] = useState<LocationPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLocations: 0,
    lastUpdate: "",
  })

  useEffect(() => {
    fetchLocationData()
    initializeMap()
  }, [])

  const fetchLocationData = async () => {
    try {
      const response = await fetch("/api/admin/location-heatmap")
      if (response.ok) {
        const data = await response.json()
        setLocationData(data.locations || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to fetch location data:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeMap = () => {
    // Simulate map initialization
    setTimeout(() => {
      setMapLoaded(true)
    }, 1000)
  }

  const exportHeatmapData = async () => {
    try {
      const response = await fetch("/api/admin/export-heatmap")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `location-heatmap-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export heatmap data:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Heatmap Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">With location data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLocations}</div>
            <p className="text-xs text-muted-foreground">Unique areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Real-time data</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                User Location Heatmap
              </CardTitle>
              <CardDescription>Real-time visualization of user locations (anonymized)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchLocationData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportHeatmapData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                Location data is anonymized and aggregated for privacy. Individual users cannot be identified from this
                heatmap.
              </AlertDescription>
            </Alert>

            {/* Map Placeholder */}
            <div
              ref={mapRef}
              className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
            >
              {loading ? (
                <div className="text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Loading location data...</p>
                </div>
              ) : !mapLoaded ? (
                <div className="text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Initializing map...</p>
                </div>
              ) : locationData.length === 0 ? (
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No location data available</p>
                  <p className="text-sm text-gray-500">Users need to opt-in to location tracking</p>
                </div>
              ) : (
                <div className="text-center">
                  <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Interactive Heatmap</p>
                  <p className="text-sm text-gray-500">Showing {locationData.length} location clusters</p>
                  <div className="mt-4 flex justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-200 rounded"></div>
                      <span className="text-xs">Low Activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      <span className="text-xs">Medium Activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-xs">High Activity</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Summary */}
            {locationData.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Top Locations</h4>
                  <div className="space-y-2">
                    {locationData
                      .sort((a, b) => b.user_count - a.user_count)
                      .slice(0, 5)
                      .map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-mono">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </span>
                          <Badge variant="outline">{location.user_count} users</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Activity Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Activity Areas</span>
                      <span className="text-sm font-medium">
                        {locationData.filter((l) => l.user_count > 10).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Activity Areas</span>
                      <span className="text-sm font-medium">
                        {locationData.filter((l) => l.user_count > 5 && l.user_count <= 10).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Activity Areas</span>
                      <span className="text-sm font-medium">
                        {locationData.filter((l) => l.user_count <= 5).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
