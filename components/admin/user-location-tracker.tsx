"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, MapPin, Clock, User, Shield, AlertTriangle, Download, Trash2, Eye } from "lucide-react"

interface UserLocation {
  id: string
  user_id: string
  user_email: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  consent_given: boolean
  ip_address?: string
  user_agent?: string
}

export function UserLocationTracker() {
  const [locations, setLocations] = useState<UserLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    consentRate: 0,
    averageAccuracy: 0,
  })

  useEffect(() => {
    fetchLocationData()
    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLocationData()
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchLocationData = async () => {
    try {
      const response = await fetch("/api/admin/user-locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Failed to fetch location data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/location-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch location stats:", error)
    }
  }

  const toggleTracking = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/admin/toggle-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        setTrackingEnabled(enabled)
      }
    } catch (error) {
      console.error("Failed to toggle tracking:", error)
    }
  }

  const exportLocationData = async () => {
    try {
      const response = await fetch("/api/admin/export-locations")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `location-data-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export location data:", error)
    }
  }

  const deleteOldData = async () => {
    if (!confirm("Are you sure you want to delete location data older than 30 days?")) {
      return
    }

    try {
      const response = await fetch("/api/admin/cleanup-locations", {
        method: "DELETE",
      })

      if (response.ok) {
        fetchLocationData()
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to delete old data:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 animate-pulse" />
            Loading Location Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Location Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Location Tracking Controls
          </CardTitle>
          <CardDescription>Manage user location tracking settings and privacy controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Global Location Tracking</p>
                <p className="text-sm text-gray-600">Enable or disable location tracking for all users</p>
              </div>
              <Switch checked={trackingEnabled} onCheckedChange={toggleTracking} />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Location tracking requires explicit user consent and complies with GDPR/CCPA regulations. Data is
                automatically deleted after 30 days.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={exportLocationData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={deleteOldData} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Old Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">With location data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Users who opted in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAccuracy.toFixed(0)}m</div>
            <p className="text-xs text-muted-foreground">Location precision</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Location Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Location Data
          </CardTitle>
          <CardDescription>Latest user location updates (last 24 hours)</CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No location data available</p>
              <p className="text-sm text-gray-500">Users need to opt-in to location tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.slice(0, 20).map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{location.user_email}</p>
                          <p className="text-xs text-gray-500">{location.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            {formatCoordinates(location.latitude, location.longitude)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.accuracy < 50 ? "default" : "secondary"}>
                          ±{location.accuracy.toFixed(0)}m
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{formatTimestamp(location.timestamp)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.consent_given ? "default" : "destructive"}>
                          {location.consent_given ? "Given" : "Denied"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                              "_blank",
                            )
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
