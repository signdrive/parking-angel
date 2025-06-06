"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  MapPin,
  Shield,
  AlertTriangle,
  Star,
  DollarSign,
  Ban,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Check if user is admin (you'll need to implement this logic)
  const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "admin@parkalgo.com"

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard")
    }
  }, [user, loading, isAdmin, router])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">Admin Panel</span>
                <Badge variant="destructive">ADMIN</Badge>
              </Link>
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
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, parking spots, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="spots">Parking Spots</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Status</div>
                    <div>Join Date</div>
                    <div>Spots Reported</div>
                    <div>Actions</div>
                  </div>
                  {recentUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">{user.joinDate}</div>
                      <div className="text-sm">{user.spots}</div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spots" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parking Spot Management</CardTitle>
                    <CardDescription>Monitor and manage parking spots</CardDescription>
                  </div>
                  <Button>Add New Spot</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                    <div>Address</div>
                    <div>Reporter</div>
                    <div>Status</div>
                    <div>Reports</div>
                    <div>Rating</div>
                    <div>Actions</div>
                  </div>
                  {recentSpots.map((spot) => (
                    <div key={spot.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="font-medium">{spot.address}</div>
                      <div className="text-sm text-gray-600">{spot.reporter}</div>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>User engagement and app usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg bg-gray-50">
                    <p className="text-gray-500">Usage Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Revenue trends and financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg bg-gray-50">
                    <p className="text-gray-500">Revenue Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Parking spot distribution across regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-lg bg-gray-50">
                  <p className="text-gray-500">Geographic Map Placeholder</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>Generate and download system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">User Activity Report</h3>
                    <p className="text-sm text-gray-600 mb-4">Detailed user engagement metrics</p>
                    <Button variant="outline" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Revenue Report</h3>
                    <p className="text-sm text-gray-600 mb-4">Financial performance analysis</p>
                    <Button variant="outline" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Parking Utilization</h3>
                    <p className="text-sm text-gray-600 mb-4">Spot usage and availability trends</p>
                    <Button variant="outline" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input type="checkbox" id="maintenance" />
                      <span className="text-sm">Enable maintenance mode</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="registration">User Registration</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input type="checkbox" id="registration" defaultChecked />
                      <span className="text-sm">Allow new user registration</span>
                    </div>
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Manage API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mapbox">Mapbox API Key</Label>
                    <Input id="mapbox" type="password" placeholder="••••••••••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="google">Google Places API Key</Label>
                    <Input id="google" type="password" placeholder="••••••••••••••••" />
                  </div>
                  <Button>Update API Keys</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
