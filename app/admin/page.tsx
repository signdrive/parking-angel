"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Users,
  MapPin,
  Shield,
  AlertTriangle,
  DollarSign,
  Eye,
  Mail,
  Star,
  Settings,
  BarChart3,
  FileText,
  Navigation,
  Crosshair,
  RefreshCw,
  Activity,
  TrendingUp,
  Map,
} from "lucide-react"
import Link from "next/link"
import { EnhancedParkingMap } from "@/components/map/enhanced-parking-map"
import { toast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [mapRef, setMapRef] = useState<any>(null)
  const [locationStats, setLocationStats] = useState({
    spotsCount: 0,
    providersCount: 0,
    lastUpdate: new Date(),
  })

  // Admin emails - these work even without email confirmation
  const adminEmails = [
    "admin@parkalgo.com",
    "your-email@example.com", // Replace with your actual email
    // Add more admin emails as needed
  ]

  // Check if user is admin (works even if email not confirmed)
  const isAdmin = user?.user_metadata?.role === "admin" || adminEmails.includes(user?.email || "")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard")
    }
  }, [user, loading, isAdmin, router])

  // Auto-center map on user location when available
  useEffect(() => {
    if (latitude && longitude && mapRef) {
      centerMapOnLocation()
      toast({
        title: "Location detected",
        description: `Centered map on your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      })
    }
  }, [latitude, longitude, mapRef])

  const centerMapOnLocation = () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location unavailable",
        description: "Please enable location services to center the map.",
        variant: "destructive",
      })
      return
    }

    // Center the map on user's location
    if (mapRef && mapRef.flyTo) {
      mapRef.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        essential: true,
      })
    }

    toast({
      title: "Map centered",
      description: `Centered on your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    })
  }

  const refreshLocation = () => {
    window.location.reload() // This will trigger geolocation again
  }

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Park Algo admin dashboard...</p>
          {locationLoading && <p className="text-sm text-gray-500 mt-2">Detecting location...</p>}
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Check if email is confirmed
  const isEmailConfirmed = user?.email_confirmed_at !== null

  // Mock data for admin dashboard
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalSpots: 3456,
    activeSpots: 2134,
    totalRevenue: 45678,
    monthlyRevenue: 12345,
    avgRating: 4.7,
    supportTickets: 23,
  }

  const recentUsers = [
    { id: "1", name: "John Doe", email: "john@example.com", status: "active", joinDate: "2024-01-15", spots: 12 },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "active", joinDate: "2024-01-14", spots: 8 },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", status: "suspended", joinDate: "2024-01-13", spots: 3 },
    { id: "4", name: "Sarah Wilson", email: "sarah@example.com", status: "active", joinDate: "2024-01-12", spots: 15 },
  ]

  const recentSpots = [
    { id: "1", address: "123 Main St", reporter: "John Doe", status: "active", reports: 5, rating: 4.5 },
    { id: "2", address: "456 Oak Ave", reporter: "Jane Smith", status: "inactive", reports: 2, rating: 3.8 },
    { id: "3", address: "789 Pine Blvd", reporter: "Mike Johnson", status: "flagged", reports: 8, rating: 2.1 },
    { id: "4", address: "321 Elm St", reporter: "Sarah Wilson", status: "active", reports: 12, rating: 4.9 },
  ]

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Overview & Analytics" },
    { id: "map", label: "Live Map", icon: Map, description: "Real-time Parking View" },
    { id: "users", label: "Users", icon: Users, description: "User Management" },
    { id: "spots", label: "Parking Spots", icon: MapPin, description: "Spot Management" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Data Insights" },
    { id: "reports", label: "Reports", icon: FileText, description: "System Reports" },
    { id: "settings", label: "Settings", icon: Settings, description: "Configuration" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Navigation Panel */}
      <div className="w-80 bg-white shadow-lg border-r flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Park Algo</h1>
              <p className="text-blue-100 text-sm">Admin Dashboard</p>
            </div>
          </div>

          {/* Location Status */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Location Status</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
                onClick={refreshLocation}
                disabled={locationLoading}
              >
                <RefreshCw className={`w-3 h-3 ${locationLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {locationError ? (
              <div className="text-red-200 text-xs">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Location unavailable
              </div>
            ) : latitude && longitude ? (
              <div className="text-green-200 text-xs">
                <Navigation className="w-3 h-3 inline mr-1" />
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            ) : (
              <div className="text-yellow-200 text-xs">
                <Activity className="w-3 h-3 inline mr-1 animate-pulse" />
                Detecting location...
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={`w-full justify-start text-left h-auto p-3 ${
                  isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
                {isActive && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
              </Button>
            )
          })}
        </nav>

        {/* Location Controls */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <Button className="w-full" onClick={centerMapOnLocation} disabled={!latitude || !longitude}>
              <Crosshair className="w-4 h-4 mr-2" />
              Center Map on Location
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={refreshLocation}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <Eye className="w-3 h-3 mr-1" />
                  User View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin"}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <Badge variant="destructive" className="text-xs">
              ADMIN
            </Badge>
          </div>

          {!isEmailConfirmed && (
            <Alert className="mt-3">
              <Mail className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Email not confirmed - consider verifying for full functionality
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
              <p className="text-gray-600 text-sm">
                {navigationItems.find((item) => item.id === activeTab)?.description}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Location Info */}
              {latitude && longitude && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              )}

              {/* Stats */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{locationStats.spotsCount}</span> spots found
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Spots</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.activeSpots.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+8%</span> from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${adminStats.monthlyRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+15%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminStats.supportTickets}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600">+3</span> new today
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Latest user registrations and activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current system status and performance</CardDescription>
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
                        <span className="text-sm">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Server Load</span>
                        <span className="text-sm text-yellow-600">Medium</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Location Services</span>
                        <Badge variant={latitude && longitude ? "default" : "destructive"}>
                          {latitude && longitude ? "Active" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Live Parking Map
                  </CardTitle>
                  <CardDescription>Real-time parking spot monitoring and management</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100vh-200px)]">
                  <EnhancedParkingMap
                    onStatsUpdate={(spotsCount, providersCount) => {
                      setLocationStats((prev) => ({
                        ...prev,
                        spotsCount,
                        providersCount,
                        lastUpdate: new Date(),
                      }))
                    }}
                    onLoadingChange={(loading) => {
                      // Handle loading state if needed
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button>
                    <Users className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>

                  <div className="border rounded-lg">
                    <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                      <div>User</div>
                      <div>Email</div>
                      <div>Status</div>
                      <div>Join Date</div>
                      <div>Spots Reported</div>
                      <div>Actions</div>
                    </div>
                    {recentUsers.map((user) => (
                      <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                        <div className="text-sm">{user.email}</div>
                        <div>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">{user.joinDate}</div>
                        <div className="text-sm">{user.spots}</div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "spots" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parking Spot Management</CardTitle>
                    <CardDescription>Monitor and manage parking spots</CardDescription>
                  </div>
                  <Button>
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Spot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Search spots..." className="max-w-sm" />
                    <Button variant="outline">Filter by Status</Button>
                    <Button variant="outline">Export Data</Button>
                  </div>

                  <div className="border rounded-lg">
                    <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                      <div>Location</div>
                      <div>Reporter</div>
                      <div>Status</div>
                      <div>Reports</div>
                      <div>Rating</div>
                      <div>Actions</div>
                    </div>
                    {recentSpots.map((spot) => (
                      <div key={spot.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{spot.address}</p>
                          <p className="text-sm text-gray-500">ID: {spot.id}</p>
                        </div>
                        <div className="text-sm">{spot.reporter}</div>
                        <div>
                          <Badge
                            variant={
                              spot.status === "active"
                                ? "default"
                                : spot.status === "flagged"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {spot.status}
                          </Badge>
                        </div>
                        <div className="text-sm">{spot.reports}</div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm">{spot.rating}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          {spot.status === "flagged" && (
                            <Button variant="outline" size="sm" className="text-red-600">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add other tab content as needed */}
          {activeTab === "analytics" && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Advanced analytics and insights coming soon.</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Center</h3>
              <p className="text-gray-600">Comprehensive reporting tools coming soon.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
              <p className="text-gray-600">Configuration options coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
