"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  MapPin,
  Shield,
  DollarSign,
  Eye,
  Mail,
  Activity,
  Globe,
  TrendingUp,
  UserCheck,
  Navigation,
} from "lucide-react"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LocationHeatmap } from "@/components/admin/location-heatmap"
import { UserLocationTracker } from "@/components/admin/user-location-tracker"
import { RealTimeAnalytics } from "@/components/admin/real-time-analytics"
import { UserManagement } from "@/components/admin/user-management"
import { ParkingSpotManagement } from "@/components/admin/parking-spot-management"
import { SystemSettings } from "@/components/admin/system-settings"
import { SecurityPanel } from "@/components/admin/security-panel"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    totalSpots: 0,
    revenue: 0,
    systemHealth: "healthy",
  })

  // Admin emails - these work even without email confirmation
  const adminEmails = [
    "admin@parkalgo.com",
    "admin@parkingangel.com",
    "your-email@example.com", // Replace with your actual email
  ]

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === "admin" || adminEmails.includes(user?.email || "")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard")
    }
  }, [user, loading, isAdmin, router])

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/real-time-stats")
        if (response.ok) {
          const data = await response.json()
          setRealTimeData(data)
        }
      } catch (error) {
        console.error("Failed to fetch real-time data:", error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const isEmailConfirmed = user?.email_confirmed_at !== null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">ParkAlgo Admin Dashboard</h1>
                <Badge variant="destructive">ADMIN</Badge>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${realTimeData.systemHealth === "healthy" ? "bg-green-500" : "bg-red-500"} animate-pulse`}
                  ></div>
                  <span className="text-sm text-gray-600">System {realTimeData.systemHealth}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <Eye className="w-4 h-4 mr-2" />
                    View User Dashboard
                  </Link>
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{user?.email}</span>
                  <Badge variant="outline">Admin</Badge>
                  {!isEmailConfirmed && (
                    <Badge variant="secondary">
                      <Mail className="w-3 h-3 mr-1" />
                      Unconfirmed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {!isEmailConfirmed && (
            <Alert className="mb-6">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Email not confirmed:</strong> Your admin access is working, but consider confirming your email
                for full functionality.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="spots">Spots</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real-time Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{realTimeData.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+12%</span> from last hour
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spots</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{realTimeData.totalSpots.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+8%</span> from yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${realTimeData.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+15%</span> from yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Load</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">Normal</span> operation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Analytics Component */}
              <RealTimeAnalytics />

              {/* Quick Actions */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => setActiveTab("users")}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("spots")}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Review Parking Spots
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("locations")}>
                      <Globe className="w-4 h-4 mr-2" />
                      View Location Heatmap
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("security")}>
                      <Shield className="w-4 h-4 mr-2" />
                      Security Center
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current system status and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Database Status</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>API Response Time</span>
                        <span className="text-sm text-green-600">142ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Connections</span>
                        <span className="text-sm">{realTimeData.activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cache Hit Rate</span>
                        <span className="text-sm text-green-600">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <RealTimeAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="spots">
              <ParkingSpotManagement />
            </TabsContent>

            <TabsContent value="locations">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      User Location Tracking
                    </CardTitle>
                    <CardDescription>
                      Real-time user locations and movement patterns (with user consent)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LocationHeatmap />
                  </CardContent>
                </Card>

                <UserLocationTracker />
              </div>
            </TabsContent>

            <TabsContent value="security">
              <SecurityPanel />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>System Reports</CardTitle>
                  <CardDescription>Generate and download comprehensive reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">User Reports</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          User Activity Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Navigation className="w-4 h-4 mr-2" />
                          Location Analytics Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <UserCheck className="w-4 h-4 mr-2" />
                          User Engagement Report
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">System Reports</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Revenue Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MapPin className="w-4 h-4 mr-2" />
                          Parking Utilization Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Security Audit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
