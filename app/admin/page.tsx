"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, MapPin, Shield, AlertTriangle, DollarSign, Eye, Mail, Star } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

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

      <main className="container mx-auto px-4 py-6">
        {!isEmailConfirmed && (
          <Alert className="mb-6">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Email not confirmed:</strong> Your admin access is working, but consider confirming your email for
              full functionality. You can confirm it later in Supabase dashboard or ignore this message.
            </AlertDescription>
          </Alert>
        )}

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
          </TabsContent>

          <TabsContent value="spots" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">892</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5.2%</span> from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spots Created Today</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,234</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.1%</span> from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12m 34s</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">-2.1%</span> from yesterday
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">Chart: User growth over time</p>
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
                    <div className="flex items-center justify-between">
                      <span>Downtown District</span>
                      <span className="text-sm text-gray-600">1,234 searches</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Business Center</span>
                      <span className="text-sm text-gray-600">987 searches</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shopping Mall</span>
                      <span className="text-sm text-gray-600">756 searches</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>University Area</span>
                      <span className="text-sm text-gray-600">543 searches</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">99.9%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">142ms</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">1,247</p>
                    <p className="text-sm text-gray-600">Active Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
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
                        <Users className="w-4 h-4 mr-2" />
                        User Registration Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        User Engagement Report
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Parking Reports</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Spot Usage Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Popular Locations Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Spot Quality Report
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Financial Reports</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Revenue Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Transaction Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Subscription Report
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">System Reports</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Error Log Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="w-4 h-4 mr-2" />
                        Performance Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Report
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Custom Report Generator</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate custom reports with specific date ranges and filters
                  </p>
                  <div className="flex items-center space-x-4">
                    <Input type="date" className="w-auto" />
                    <span className="text-sm text-gray-500">to</span>
                    <Input type="date" className="w-auto" />
                    <Button>Generate Custom Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic system preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Enable maintenance mode for system updates</p>
                    </div>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send system email notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                    </div>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                    </div>
                    <select className="text-sm border rounded px-2 py-1">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-gray-600">Limit API requests per user</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parking Settings</CardTitle>
                  <CardDescription>Configure parking-specific features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Search Radius</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>0.5 miles</option>
                      <option>1 mile</option>
                      <option>2 miles</option>
                      <option>5 miles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Spot Verification</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>Automatic</option>
                      <option>Manual Review</option>
                      <option>Community Voting</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Real-time Updates</p>
                      <p className="text-sm text-gray-600">Enable live spot availability updates</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure system notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Send push notifications to users</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send SMS alerts for important updates</p>
                    </div>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Admin Alerts</p>
                      <p className="text-sm text-gray-600">Notify admins of system issues</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and version information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Application Version</p>
                    <p className="text-lg font-bold">v2.1.0</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Database Version</p>
                    <p className="text-lg font-bold">PostgreSQL 15.2</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Backup</p>
                    <p className="text-lg font-bold">2 hours ago</p>
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <Button variant="outline">Backup Database</Button>
                  <Button variant="outline">Clear Cache</Button>
                  <Button variant="outline">Restart Services</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
