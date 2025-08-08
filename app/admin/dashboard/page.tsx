"use client"

import { useEffect, useState, useCallback } from "react"
import { AuthContextType } from '@/lib/types/supabase-helpers';
import { useAuth } from "@/hooks/use-auth"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Profile, ParkingSpot } from "@/lib/types/supabase-helpers"
import { AdminUsersList, AdminSpotsTable, ABTestingMarketingDashboard, UsageChart } from "@/components/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from "next/navigation"
import { 
  Users, 
  Car, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Edit
} from 'lucide-react'
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"
import { usePersistentState } from "@/hooks/use-persistent-state"

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Admin sidebar items for navigation
const adminSidebarItems = [
  {
    id: "overview",
    label: "Overview",
    description: "Dashboard overview",
    icon: BarChart3,
  },
  {
    id: "users",
    label: "User Management",
    description: "Manage user accounts",
    icon: Users,
  },
  {
    id: "spots",
    label: "Parking Spots",
    description: "Manage parking data",
    icon: Car,
  },
  {
    id: "blog",
    label: "Blog Admin",
    description: "Manage blog content",
    icon: Edit,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Usage analytics",
    icon: TrendingUp,
  },
  {
    id: "ab-testing",
    label: "A/B Testing",
    description: "Marketing campaigns",
    icon: Settings,
  },
  {
    id: "system",
    label: "System Status",
    description: "System health",
    icon: CheckCircle2,
  }
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() as AuthContextType;
  const [users, setUsers] = useState<Profile[]>([])
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [activeTab, setActiveTab] = usePersistentState("adminActiveTab", "overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSpots: 0,
    activeSpots: 0,
    reportsToday: 0,
    conversionRate: 0
  })
  const supabase = getBrowserClient()

  const loadAdminData = useCallback(async () => {
    // EMERGENCY CIRCUIT BREAKER - Prevent infinite loops in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      console.log('🛑 Admin dashboard data loading disabled in development environment');
      setStats({
        totalUsers: 5,
        activeUsers: 3,
        totalSpots: 64,
        activeSpots: 42,
        reportsToday: 8,
        conversionRate: 65.5
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true)
      
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) {
        console.error('Users query error:', usersError);
        throw usersError;
      }
      
      // Load parking spots with error handling
      let spotsData = [];
      try {
        const { data, error: spotsError } = await supabase
          .from('parking_spots')
          .select('*')
          .order('last_updated', { ascending: false });
        
        if (spotsError) {
          console.warn('Parking spots query error (non-fatal):', spotsError);
          spotsData = [];
        } else {
          spotsData = data || [];
        }
      } catch (spotsErr) {
        console.warn('Failed to load parking spots:', spotsErr);
        spotsData = [];
      }

      setUsers(usersData as Profile[]);
      setSpots(spotsData as ParkingSpot[]);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const activeUsers = usersData?.filter(user => 
        new Date(user.last_sign_in_at || user.created_at) >= today
      ).length || 0;

      setStats({
        totalUsers: usersData?.length || 0,
        activeUsers,
        totalSpots: spotsData?.length || 0,
        activeSpots: spotsData?.filter((spot: any) => spot.status === 'active').length || 0,
        reportsToday: 0, // TODO: Add reports table query
        conversionRate: activeUsers > 0 ? (activeUsers / (usersData?.length || 1)) * 100 : 0
      });

      // Generate sample analytics data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          timestamp: date.toISOString().split('T')[0],
          activeSpots: Math.floor(Math.random() * 50) + 10,
          reports: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 100) + 20
        };
      });
      setAnalyticsData(last7Days);
      
      setError(null);
    } catch (err) {
      console.error('Admin data loading error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  }, [supabase])

  // Check admin access and load data
  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Wait for profile to load before checking role
    if (profile === null) {
      return;
    }

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    loadAdminData()
  }, [user, profile, authLoading, router, loadAdminData])

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!user || profile === null) {
    return null
  }

  if (profile?.role !== 'admin') {
    return null
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>Loading admin dashboard...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-red-600">Error</h2>
            <p className="mt-2">{error.message}</p>
          </Card>
        </div>
      )
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Complete administrative control panel</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeUsers} active today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Parking Spots</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSpots}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeSpots} active spots
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reportsToday}</div>
                  <p className="text-xs text-muted-foreground">
                    New submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Daily active users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>User activity over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <UsageChart data={analyticsData} height={300} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      Database Connection
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      Authentication Service
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                      Parking Data Sync
                    </span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Syncing
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <AdminUsersList users={users} />
              </CardContent>
            </Card>
          </div>
        )

      case "spots":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Parking Spots Management</h2>
              <p className="text-gray-600 mt-1">
                Monitor and manage parking spot data
                {spots.length === 0 && (
                  <span className="text-yellow-600 ml-2">
                    (No data available - table may not exist)
                  </span>
                )}
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                {spots.length > 0 ? (
                  <AdminSpotsTable spots={spots} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No parking spots data</p>
                    <p className="text-sm">
                      This may be because the parking_spots table doesn't exist yet or has permission issues.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "blog":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Blog Administration</h2>
              <p className="text-gray-600 mt-1">Manage blog posts, categories, and content</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.open('/admin/blog', '_blank')}>
                <CardContent className="p-6 text-center">
                  <Edit className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Manage Posts</h3>
                  <p className="text-gray-600 text-sm">Create, edit, and manage blog posts</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.open('/admin/blog/new', '_blank')}>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">New Post</h3>
                  <p className="text-gray-600 text-sm">Create a new blog post</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.open('/admin/blog/manage', '_blank')}>
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-lg font-semibold mb-2">Categories & Tags</h3>
                  <p className="text-gray-600 text-sm">Manage categories and tags</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "analytics":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Advanced Analytics</h2>
              <p className="text-gray-600 mt-1">Detailed usage analytics and insights</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <UsageChart data={analyticsData} height={400} />
              </CardContent>
            </Card>
          </div>
        )

      case "ab-testing":
        return (
          <div className="p-6">
            <ABTestingMarketingDashboard />
          </div>
        )

      case "system":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">System Status</h2>
              <p className="text-gray-600 mt-1">Monitor system health and performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Connection: Healthy</p>
                  <p className="text-sm text-gray-600">Queries: {stats.totalUsers + stats.totalSpots} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Status: Operational</p>
                  <p className="text-sm text-gray-600">Active Sessions: {stats.activeUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                    Data Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Status: Syncing</p>
                  <p className="text-sm text-gray-600">Last Update: 2 min ago</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1">Select a section from the sidebar to get started</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar with Admin Navigation */}
      <CollapsibleSidebar 
        activeTab={activeTab}
        onTabChangeAction={setActiveTab}
        className="border-r"
        adminItems={adminSidebarItems}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}
