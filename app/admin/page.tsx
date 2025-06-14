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
import { getAdminSupabaseOrThrow } from "@/lib/supabase/admin-client";
import type { Profile, ParkingSpot, SpotStatistics } from "@/types/admin"
import { useAdminOperations } from "@/hooks/use-admin-operations"
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ParkingSpotForm } from "@/components/admin/parking-spot-form"

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const {
    isLoading: isOperationLoading,
    editProfile, // Keep if used for editing, otherwise remove if not implemented
    suspendUser,
    addParkingSpot,
    updateParkingSpot,
    removeParkingSpot,
  } = useAdminOperations()

  const { 
    profiles, 
    parkingSpots, 
    spotStats, 
    analyticsData 
  } = useAdminRealtime()

  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | undefined>()

  const [role, setRole] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  const isDataLoading = useMemo(() => !profiles && !parkingSpots, [profiles, parkingSpots]);

  useEffect(() => {
    let isMounted = true

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
        const supabase = getAdminSupabaseOrThrow();

        if (user.user_metadata?.role === 'admin') {
          console.log('Found admin role in user metadata')
          if (isMounted) {
            setRole('admin')
            setRoleLoading(false);
          }
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        if (!isMounted) return

        if (profileError) {
          console.error('Error fetching user role:', profileError)
          setRoleError(profileError.message)
          setRoleLoading(false)
          return
        }

        if (!profileData) {
          console.log('No profile found, checking email list')
          if (user.email && ['admin@parkalgo.com', 'admin@parking-angel.com', 'signdrive@gmail.com'].includes(user.email)) {
            console.log('Email found in admin list')
            setRole('admin')
          } else {
            setRole('user')
          }
        } else {
          console.log('Profile found:', profileData)
          setRole(profileData.role || 'user')
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
    }
  }, [user])

  const isAdmin = useMemo(() => role === 'admin', [role])

  useEffect(() => {
    if (!authLoading && !roleLoading && !isAdmin) {
      const message = role === null 
        ? 'Access denied: Role not loaded yet or user not authenticated.'
        : `Access denied: User is not admin (role: ${role})`
      console.log(message)
      
      if ((role !== null && !isAdmin) || (!authLoading && !user)) {
         toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.push('/dashboard')
      }
    }
  }, [authLoading, roleLoading, isAdmin, role, router, user])

  const filteredProfiles = useMemo(() => {
    return profiles?.filter(profile => 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [profiles, searchTerm])

  const menuItems = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "profiles", label: "Profiles", icon: Users },
    { id: "parking-spots", label: "Parking Spots", icon: MapPin },
    { id: "analytics", label: "Analytics", icon: Eye },
    { id: "reports", label: "Reports", icon: AlertTriangle },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  if (authLoading || roleLoading) {
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

    const success = await suspendUser(userId) // suspendUser now returns boolean
    if (success) {
      toast({
        title: "Success",
        description: "User has been suspended.", // Or "User status updated." if it's a soft suspension
      })
      // Optionally, trigger a re-fetch or update local state if profiles aren't auto-updating
    } else {
      // The hook's handleError should have already shown a toast
      // You might add additional logging or UI feedback here if needed
      console.error("Failed to suspend user from page component.")
      // toast({
      //   title: "Error",
      //   description: "Failed to suspend user. Check console for details.", // Generic message as hook handles specifics
      //   variant: "destructive"
      // })
    }
  }

  const handleRemoveSpot = async (spotId: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this parking spot?")
    if (!confirmed) return

    const success = await removeParkingSpot(spotId) // removeParkingSpot now returns boolean
    if (success) {
      toast({
        title: "Success",
        description: "Parking spot has been removed.",
      })
      // Optionally, trigger a re-fetch or update local state if parkingSpots aren't auto-updating
    } else {
      // The hook's handleError should have already shown a toast
      console.error("Failed to remove parking spot from page component.")
      // toast({
      //   title: "Error",
      //   description: "Failed to remove parking spot. Check console for details.",
      //   variant: "destructive"
      // })
    }
  }

  const handleSpotSubmit = async (data: Omit<ParkingSpot, 'id' | 'created_at' | 'last_updated' | 'reports'> & { reports?: number }) => {
    try {
      if (editingSpot) {
        // For updates, we pass the data as received. If 'reports' is part of 'data', it will be included.
        // The updateParkingSpot in the hook expects Partial<ParkingSpot>, so this is fine.
        await updateParkingSpot(editingSpot.id, data as Partial<ParkingSpot>);
        setEditingSpot(undefined);
      } else {
        // For adding a new spot, ensure `reports` is provided if required by the type, defaulting to 0.
        const spotDataWithReports: Omit<ParkingSpot, "id" | "created_at" | "last_updated"> = {
          ...data,
          reports: data.reports || 0, // Default reports to 0 if not provided
        };
        await addParkingSpot(spotDataWithReports);
      }
      setIsSpotFormOpen(false);
      toast({
        title: "Success",
        description: `Parking spot ${editingSpot ? 'updated' : 'added'} successfully.`,
      });
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
      {/* Sidebar */}
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
                  <div className="text-2xl font-bold">{profiles?.length || 0}</div>
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
                  <div className="text-2xl font-bold">{spotStats?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {spotStats?.total || 0} total spots
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spotStats?.dailyReports || 0}</div>
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
                  <div className="text-2xl font-bold">{spotStats?.uptime || 0}%</div>
                  <div className="text-xs text-gray-500">Last 30 days</div>
                </CardContent>
              </Card>
            </div>
            {/* ... more overview content if any ... */}
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
                    {isDataLoading && (!profiles || profiles.length === 0) ? (
                      <div className="p-8 text-center"><LoadingSpinner /></div>
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
                          <div>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toast({ title: "Edit Clicked", description: `Edit action for ${profile.full_name} not fully implemented.`})}
                              disabled={isOperationLoading}
                            >
                              {isOperationLoading ? "Saving..." : "Edit"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleSuspendUser(profile.id)}
                              disabled={isOperationLoading || profile.status === 'suspended'}
                            >
                              {isOperationLoading ? "Processing..." : (profile.status === 'suspended' ? 'Suspended' : 'Suspend')}
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
                      {isDataLoading && (!parkingSpots || parkingSpots.length === 0) ? (
                         <div className="p-8 text-center"><LoadingSpinner /></div>
                      ) : parkingSpots && parkingSpots.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No parking spots found
                        </div>
                      ) : (
                        parkingSpots?.map((spot: ParkingSpot) => (
                          <div key={spot.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>
                              <p className="font-medium">{spot.location_name}</p>
                              <p className="text-sm text-gray-500">
                                {spot.coordinates ? `${spot.coordinates.lat?.toFixed(4)}, ${spot.coordinates.lng?.toFixed(4)}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Badge variant="outline">{spot.type}</Badge>
                            </div>
                            <div>
                              {/* Corrected Badge variant logic for ParkingSpot status */}
                              <Badge variant={spot.status === 'active' ? 'default' : spot.status === 'occupied' ? 'secondary' : spot.status === 'inactive' ? 'outline' : 'destructive'}>
                                {spot.status ? spot.status.charAt(0).toUpperCase() + spot.status.slice(1) : 'Unknown'}
                              </Badge>
                            </div>
                            <div className="text-sm">{spot.reports || 0} reports</div>
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
                    <div className="text-2xl font-bold">{spotStats?.active || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Daily Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{spotStats?.dailyReports || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{spotStats?.uptime || 0}%</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>System usage patterns and trends (using analyticsData)</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {analyticsData && analyticsData.length > 0 ? (
                    <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center text-gray-700 overflow-auto text-xs">
                      <pre>{JSON.stringify(analyticsData.slice(-5), null, 2)}</pre> 
                    </div>
                  ) : (
                    <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                      No analytics data available or loading...
                    </div>
                  )}
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

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system preferences and features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div className="flex justify-end">
                    <Button>
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
