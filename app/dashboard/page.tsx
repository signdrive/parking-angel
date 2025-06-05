"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { useRouter } from "next/navigation"
import { ParkingMap } from "@/components/map/parking-map"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { PredictiveAnalytics } from "@/components/analytics/predictive-analytics"
import { SmartNotifications } from "@/components/notifications/smart-notifications"
import { FirebaseUserProfile } from "@/components/dashboard/firebase-user-profile"
import { NotificationTest } from "@/components/firebase/notification-test"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, LogOut, User, Brain, BarChart3, Bell, Zap, Settings, Bug } from "lucide-react"
import Link from "next/link"
import { AuthDebug } from "@/components/debug/auth-debug"

export default function DashboardPage() {
  const { user: supabaseUser, loading: supabaseLoading, signOut: supabaseSignOut } = useAuth()
  const { user: firebaseUser, loading: firebaseLoading, signOut: firebaseSignOut } = useFirebaseAuth()
  const router = useRouter()
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [showDebug, setShowDebug] = useState(false)

  // Use Firebase user if available, otherwise Supabase user
  const user = firebaseUser || supabaseUser
  const loading = firebaseLoading || supabaseLoading
  const signOut = firebaseUser ? firebaseSignOut : supabaseSignOut

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated and not loading
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Show loading state only while actually loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to database...</p>
        </div>
      </div>
    )
  }

  // If no user and not loading, redirect (this should not show)
  if (!user) {
    return null
  }

  const getUserDisplayName = () => {
    if (firebaseUser) {
      return firebaseUser.displayName || firebaseUser.email
    }
    return supabaseUser?.user_metadata?.full_name || supabaseUser?.email
  }

  const getAuthProvider = () => {
    if (firebaseUser) return "Firebase"
    return "Supabase"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parking Angel</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                AI POWERED
              </span>
              <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {getAuthProvider()}
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)} className="text-gray-500">
                <Bug className="w-4 h-4 mr-2" />
                Debug
              </Button>

              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{getUserDisplayName()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showDebug && (
        <div className="container mx-auto px-4 py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-yellow-800">Debug Information</h3>
            <p className="text-xs text-yellow-600">This debug panel is optional and can be hidden</p>
          </div>
          <AuthDebug />
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {getUserDisplayName()}! 🎉</h1>
            <p className="text-blue-100">Your dashboard is ready. Everything is working perfectly!</p>
          </div>

          <StatsCards totalSpots={0} activeUsers={1} averageRating={4.8} responseTime="2.3s" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Live Map
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Smart Alerts
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border h-[600px]">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">AI-Enhanced Live Parking Map</h2>
                <p className="text-sm text-gray-600">
                  Smart predictions • Real-time updates • {getAuthProvider()} powered
                </p>
              </div>
              <div className="h-[calc(600px-80px)]">
                <ParkingMap onSpotSelect={setSelectedSpot} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIAssistant />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SmartNotifications />
              {firebaseUser && <NotificationTest />}
            </div>
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Upgrade to Premium</h3>
                <ul className="space-y-2 mb-6">
                  <li>• AI-powered parking predictions</li>
                  <li>• Priority spot notifications</li>
                  <li>• Advanced analytics dashboard</li>
                  <li>• Custom route optimization</li>
                  <li>• Firebase real-time features</li>
                </ul>
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">Upgrade Now - $9.99/month</Button>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
                <ul className="space-y-2 mb-6">
                  <li>• White-label solution</li>
                  <li>• Custom Firebase integration</li>
                  <li>• Dedicated support</li>
                  <li>• Advanced reporting</li>
                  <li>• Multi-city deployment</li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {firebaseUser && <FirebaseUserProfile />}
              <RecentActivity activities={[]} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
