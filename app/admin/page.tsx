"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Shield, AlertTriangle, DollarSign, Eye, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { adminSupabase } from "@/lib/supabase/admin-client"
import type { Profile, ParkingSpot, SpotStatistics } from "@/types/admin"
import { useAdminOperations } from "@/hooks/use-admin-operations"
import { useRealtimeAdmin } from "@/hooks/use-realtime-admin"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ParkingSpotForm } from "@/components/admin/parking-spot-form"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const {
    isLoading: isOperationLoading,
    editProfile,
    suspendUser,
    addParkingSpot,
    updateParkingSpot,
    removeParkingSpot,
    getSystemStats,
  } = useAdminOperations()

  const { 
    realtimeProfiles, 
    realtimeSpots, 
    stats: spotStats, 
    isLoading: isRealtimeLoading,
    refresh 
  } = useRealtimeAdmin()

  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | undefined>()

  // Admin verification
  const [role, setRole] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function fetchUserRole() {
      if (!user?.id) {
        console.log('No user ID available')
        if (isMounted) {
          setRoleError('No user ID available')
          setRoleLoading(false)
        }
        return
      }

      try {
        console.log('Fetching role for user:', user.id, user.email)

        // First try to get role from user metadata
        if (user.user_metadata?.role === 'admin') {
          console.log('Found admin role in user metadata')
          if (isMounted) {
            setRole('admin')
           
          }
          return
        }

        // Then check the profiles table
        const { data: profile, error } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        if (!isMounted) return

        if (error) {
          console.error('Error fetching user role:', error)
          setRoleError(error.message)
          setRoleLoading(false)
          return
        }

        if (!profile) {
          console.log('No profile found, checking email list')
          // Check if email is in admin list
          if (user.email && ['admin@parkalgo.com', 'admin@parking-angel.com', 'signdrive@gmail.com'].includes(user.email)) {
            console.log('Email found in admin list')
            setRole('admin')
          } else {
            setRole('user')
          }
        } else {
          console.log('Profile found:', profile)
          setRole(profile.role || 'user')
        }
        
        setRoleLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error('Error in fetchUserRole:', error)
        setRoleError(error instanceof Error ? error.message : 'Unexpected error while fetching role')
        setRoleLoading(false)
      }
    }

    if (user) {
      fetchUserRole()
    } else {
      setRole(null)
      setRoleLoading(false)
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [user])

  const isAdmin = useMemo(() => role === 'admin', [role])

  useEffect(() => {
    if (!loading && !roleLoading && !isAdmin) {
      const message = role === null 
        ? 'Access denied: Role not loaded yet'
        : `Access denied: User is not admin (role: ${role})`
      console.log(message)
      
      if (role !== null) {
        router.push('/dashboard')
      }
    }
  }, [loading, roleLoading, isAdmin, role, router])

  // Fetch profiles and parking spots
  const fetchData = async () => {
    if (!isAdmin) return
    
    try {
      // Refresh data from realtime hook
      await refresh()
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch admin data. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  // Filter profiles based on search term
  const filteredProfiles = useMemo(() => {
    return realtimeProfiles?.filter(profile => 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [realtimeProfiles, searchTerm])

  const menuItems = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "profiles", label: "Profiles", icon: Users },
    { id: "parking-spots", label: "Parking Spots", icon: MapPin },
    { id: "analytics", label: "Analytics", icon: Eye },
    { id: "reports", label: "Reports", icon: AlertTriangle },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading admin dashboard...</p>
          {roleError && (
            <p className="text-red-600 mt-2">Error: {roleError}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>User ID: {user?.id || 'Not loaded'}</p>
            <p>Email: {user?.email || 'Not loaded'}</p>
            <p>Role: {role || 'Not loaded'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Access Denied: Admin privileges required</p>
          <p className="text-sm text-gray-600 mt-2">
            Current role: {role || 'No role assigned'}
          </p>
          {roleError && (
            <p className="text-red-600 mt-2">Error: {roleError}</p>
          )}
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const totalUsers = useMemo(() => realtimeProfiles?.length || 0, [realtimeProfiles])

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading admin dashboard...</p>
          {roleError && (
            <p className="text-red-600 mt-2">Error: {roleError}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>User ID: {user?.id || 'Not loaded'}</p>
            <p>Email: {user?.email || 'Not loaded'}</p>
            <p>Role: {role || 'Not loaded'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Access Denied: Admin privileges required</p>
          <p className="text-sm text-gray-600 mt-2">
            Current role: {role || 'No role assigned'}
          </p>
          {roleError && (
            <p className="text-red-600 mt-2">Error: {roleError}</p>
          )}
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleSuspendUser = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to suspend this user?")
    if (!confirmed) return

    const success = await suspendUser(userId)
    if (success) {
      // The realtime subscription will update the UI
      toast({
        title: "Success",
        description: "User has been suspended.",
      })
    }
  }

  const handleRemoveSpot = async (spotId: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this parking spot?")
    if (!confirmed) return

    const success = await removeParkingSpot(spotId)
    if (success) {
      // The realtime subscription will update the UI
      toast({
        title: "Success",
        description: "Parking spot has been removed.",
      })
    }
  }

  const handleSpotSubmit = async (data: Omit<ParkingSpot, 'id' | 'reports' | 'created_at' | 'last_updated'>) => {
    try {
      if (editingSpot) {
        await updateParkingSpot(editingSpot.id, data)
        setEditingSpot(undefined)
      } else {
        await addParkingSpot(data)
      }
      setIsSpotFormOpen(false)
      // No need to manually refresh, the real-time subscription will update the UI
    } catch (error) {
      console.error('Error handling spot submit:', error)
      toast({
        title: "Error",
        description: "Failed to save parking spot. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openSpotForm = (spot?: ParkingSpot) => {
    setEditingSpot(spot)
    setIsSpotFormOpen(true)
  }

  const closeSpotForm = () => {
    setEditingSpot(undefined)
    setIsSpotFormOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#16181D] text-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold">Admin Panel</span>
            <Badge variant="destructive" className="ml-auto">ADMIN</Badge>
          </div>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start mb-1 ${activeTab === item.id ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {menuItems.map(item => (
              <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spotStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Total registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Spots</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spotStats.activeSpots}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {spotStats.totalSpots} total spots
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spotStats.dailyReports}</div>
                  <p className="text-xs text-muted-foreground">
                    Reports in the last 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spotStats.uptime}%</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Management</CardTitle>
                    <CardDescription>Manage user profiles and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search profiles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  <div className="border rounded-lg">
                    <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                      <div>User</div>
                      <div>Email</div>
                      <div>Join Date</div>
                      <div>Actions</div>
                    </div>
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : filteredProfiles.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No profiles found
                      </div>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <div key={profile.id} className="grid grid-cols-4 gap-4 p-4 border-b items-center hover:bg-gray-50">
                          <div>
                            <p className="font-medium">{profile.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">ID: {profile.id}</p>
                          </div>
                          <div>{profile.email}</div>
                          <div>{new Date(profile.created_at).toLocaleDateString()}</div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editProfile(profile.id, { full_name: profile.full_name })}
                              disabled={isOperationLoading}
                            >
                              {isOperationLoading ? "Saving..." : "Edit"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleSuspendUser(profile.id)}
                              disabled={isOperationLoading}
                            >
                              {isOperationLoading ? "Processing..." : "Suspend"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parking-spots">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Parking Spots Management</CardTitle>
                    <CardDescription>Monitor and manage parking spots</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openSpotForm()}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add New Spot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search spots..."
                      className="max-w-sm"
                    />
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                      <div>Location</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Reports</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : realtimeSpots.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No parking spots found
                        </div>
                      ) : (
                        realtimeSpots.map((spot: ParkingSpot) => (
                          <div key={spot.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>
                              <p className="font-medium">{spot.location_name}</p>
                              <p className="text-sm text-gray-500">
                                {`${spot.coordinates.lat.toFixed(4)}, ${spot.coordinates.lng.toFixed(4)}`}
                              </p>
                            </div>
                            <div>
                              <Badge variant="outline">{spot.type}</Badge>
                            </div>
                            <div>
                              <Badge variant={spot.status === 'active' ? 'default' : 'destructive'}>
                                {spot.status === 'active' ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <div className="text-sm">{spot.reports} reports</div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openSpotForm(spot)}
                                disabled={isOperationLoading}
                              >
                                {isOperationLoading ? "Saving..." : "Edit"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRemoveSpot(spot.id)}
                                disabled={isOperationLoading}
                              >
                                {isOperationLoading ? "Removing..." : "Remove"}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parking Spot Form */}
            <ParkingSpotForm
              isOpen={isSpotFormOpen}
              onClose={closeSpotForm}
              onSubmit={handleSpotSubmit}
              initialData={editingSpot}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Active Spots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{spotStats.activeSpots}</div>
                    <div className="text-xs text-green-500">+12% from last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Daily Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{spotStats.dailyReports}</div>
                    <div className="text-xs text-green-500">+8% from last week</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{spotStats.uptime}%</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>System usage patterns and trends</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* Add chart or graph component here */}
                  <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    Usage Graph Placeholder
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>System Reports</CardTitle>
                    <CardDescription>Generate and view system reports</CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline">
                      Export as CSV
                    </Button>
                    <Button>
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Usage Report</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-start text-left">
                          Download PDF
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Error Logs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-start text-left">
                          View Logs
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">User Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-start text-left">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              {/* Navigation Back to User Dashboard */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Return to User Dashboard</h3>
                      <p className="text-sm text-gray-500">Switch back to your user view</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system preferences and features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Feature Toggles */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Feature Toggles</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Enable AI Predictions</label>
                          <p className="text-xs text-gray-500">Allow AI to predict parking availability</p>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Real-time Updates</label>
                          <p className="text-xs text-gray-500">Enable live updates for parking spots</p>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">API Configuration</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rate Limit (requests/minute)</label>
                        <Input type="number" placeholder="60" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cache Duration (minutes)</label>
                        <Input type="number" placeholder="5" />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">System Alerts</label>
                          <p className="text-xs text-gray-500">Receive critical system notifications</p>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Usage Reports</label>
                          <p className="text-xs text-gray-500">Weekly system usage reports</p>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="flex justify-end">
                    <Button>
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>Irreversible system operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Clear System Cache</label>
                      <p className="text-xs text-gray-500">Remove all cached data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Clear Cache
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Reset System</label>
                      <p className="text-xs text-gray-500">Reset all settings to default</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
