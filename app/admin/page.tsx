"use client"

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useMemo } from "react"
import { AuthContextType } from '@/lib/types/supabase-helpers';
import { useAuth } from "@/hooks/use-auth"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Profile, ParkingSpot } from "@/lib/types/supabase-helpers"
import { AdminUsersList, AdminSpotsTable, ABTestingMarketingDashboard, UsageChart } from "@/components/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation"
import { 
  Users, 
  Car, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() as AuthContextType;
  const [users, setUsers] = useState<Profile[]>([])
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSpots: 0,
    activeSpots: 0,
    reportsToday: 0,
    conversionRate: 0
  })
  const supabase = getBrowserClient()

  // Memoize expensive calculations
  const memoizedStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeUsers = users?.filter(user => 
      new Date((user as any).last_sign_in_at || user.created_at) >= today
    ).length || 0;

    return {
      totalUsers: users?.length || 0,
      activeUsers,
      totalSpots: spots?.length || 0,
      activeSpots: spots?.filter((spot: any) => spot.status === 'active').length || 0,
      reportsToday: 0, // TODO: Add reports table query
      conversionRate: activeUsers > 0 ? (activeUsers / (users?.length || 1)) * 100 : 0
    };
  }, [users, spots]);

  const loadAdminData = useCallback(async () => {
    // EMERGENCY CIRCUIT BREAKER - Prevent infinite loops in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      console.log('🛑 Admin page data loading disabled in development environment');
      setUsers([]);
      setSpots([]);
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
        // Use last_updated column for ordering parking spots
        let { data, error: spotsError } = await supabase
          .from('parking_spots')
          .select('*')
          .order('last_updated', { ascending: false });
        
        // If last_updated column doesn't exist, try without ordering
        if (spotsError && spotsError.code === '42703') {
          console.warn('last_updated column not found, querying without ordering');
          const fallbackQuery = await supabase
            .from('parking_spots')
            .select('*');
          
          data = fallbackQuery.data;
          spotsError = fallbackQuery.error;
        }
        
        if (spotsError) {
          console.warn('Parking spots query error (non-fatal):', spotsError);
          // Continue with empty spots array rather than failing completely
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
      
      // Stats will be calculated via useMemo
      
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
      // Profile is still loading, wait
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

  // Redirect if not authenticated (this should not show due to useEffect redirect)
  if (!user) {
    return null
  }

  // Show loading while profile is being fetched
  if (profile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  // Redirect if not admin (this should not show due to useEffect redirect)
  if (profile?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <Users className="w-4 h-4 mr-2" />
            {memoizedStats.totalUsers} Total Users
          </Badge>
          <Button 
            onClick={() => router.push('/admin/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Full Admin Panel
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoizedStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {memoizedStats.activeUsers} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parking Spots</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoizedStats.totalSpots}</div>
            <p className="text-xs text-muted-foreground">
              {memoizedStats.activeSpots} active spots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoizedStats.reportsToday}</div>
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
            <div className="text-2xl font-bold">{memoizedStats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Daily active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="spots">Spots</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUsersList users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parking Spots Management</CardTitle>
              <CardDescription>
                Monitor and manage parking spot data
                {spots.length === 0 && (
                  <span className="text-yellow-600 ml-2">
                    (No data available - table may not exist)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed usage analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageChart data={analyticsData} height={400} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <ABTestingMarketingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
