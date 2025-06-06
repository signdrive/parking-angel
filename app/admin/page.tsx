"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, MapPin, Shield, AlertTriangle, DollarSign, Eye, Mail } from "lucide-react"
import Link from "next/link"

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
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parking Spot Management</CardTitle>
                <CardDescription>Monitor and manage parking spots</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Parking spot management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View detailed analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Reporting features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
