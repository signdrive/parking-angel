"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { EnhancedParkingMap } from "@/components/map/enhanced-parking-map"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  LogOut,
  User,
  Brain,
  BarChart3,
  Bell,
  Zap,
  Settings,
  Bug,
  Shield,
  Clock,
  Download,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { UserProfileEnhanced } from "@/components/dashboard/user-profile-enhanced"
import { ParkingHistory } from "@/components/dashboard/parking-history"
import { SmartAssistant } from "@/components/ai/smart-assistant"
import { RouteOptimizer } from "@/components/ai/route-optimizer"
import { AIAnalyticsDashboard } from "@/components/ai/ai-analytics-dashboard"
import { SmartNotifications } from "@/components/ai/smart-notifications"
import { PWADebug } from "@/components/pwa/pwa-debug"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [showDebug, setShowDebug] = useState(false)

  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log("Dashboard state:", {
      user: !!user,
      loading,
    })
  }, [user, loading])

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated and not loading
    if (!loading && !user) {
      console.log("Redirecting to home - no user and not loading")
      router.push("/")
    }
  }, [user, loading, router])

  // PWA Installation logic
  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("Install prompt captured!")
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("PWA was installed")
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleHeaderInstall = async () => {
    console.log("Header install button clicked!")

    if (isInstalled) {
      alert("App is already installed!")
      return
    }

    if (!deferredPrompt) {
      console.log("No installation prompt available")

      // For Safari on iOS, show instructions
      if (
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome") &&
        /iPhone|iPad|iPod/.test(navigator.userAgent)
      ) {
        alert(
          "To install this app on iOS:\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm",
        )
        return
      }

      // For other browsers
      if (navigator.userAgent.includes("Firefox")) {
        alert("Firefox doesn't support PWA installation. Please use Chrome, Edge, or Safari.")
        return
      }

      alert(
        "Installation not available in this browser. Please try:\n• Chrome or Edge on desktop\n• Chrome on Android\n• Safari on iOS (use Share → Add to Home Screen)",
      )
      return
    }

    try {
      console.log("Showing install prompt...")
      // Show the prompt
      await deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice

      console.log("User choice:", choiceResult.outcome)

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        setIsInstalled(true)
      } else {
        console.log("User dismissed the install prompt")
      }

      // Clear the saved prompt as it can't be used again
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (err) {
      console.error("Error during installation:", err)
      alert("Installation failed. Please try again or use your browser's install option.")
    }
  }

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

  // If no user and not loading, redirect
  if (!user) {
    return null
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email
  }

  // Mock data for testing
  const mockActivities = [
    {
      id: "1",
      type: "spot_reported",
      user: "John Doe",
      location: "123 Main St",
      timestamp: "10 minutes ago",
      details: "Free parking spot available",
    },
    {
      id: "2",
      type: "spot_taken",
      user: "Jane Smith",
      location: "456 Oak Ave",
      timestamp: "25 minutes ago",
    },
    {
      id: "3",
      type: "spot_reviewed",
      user: "Mike Johnson",
      location: "789 Pine Blvd",
      timestamp: "1 hour ago",
      details: "Great spot, easy to find",
    },
  ]

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
                SUPABASE
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {isInstalled ? (
                <Button variant="outline" size="sm" className="bg-green-50 text-green-600 border-green-200" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  App Installed
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                  onClick={handleHeaderInstall}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isInstallable ? "Install App" : "Get App"}
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)} className="text-gray-500">
                <Bug className="w-4 h-4 mr-2" />
                Debug
              </Button>

              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{getUserDisplayName()}</span>
              </div>
              {(user?.user_metadata?.role === "admin" || user?.email === "admin@parkalgo.com") && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {getUserDisplayName()}! 🎉</h1>
            <p className="text-blue-100">Your dashboard is ready. Running on Supabase authentication with Grok AI.</p>
            {!isInstalled && isInstallable && (
              <div className="mt-3 p-3 bg-white/10 rounded-md">
                <p className="text-sm text-blue-100">
                  💡 <strong>Tip:</strong> Install the app for a better experience! Click the "Install App" button
                  above.
                </p>
              </div>
            )}
          </div>

          {showDebug && (
            <div className="mb-6">
              <PWADebug />
            </div>
          )}

          <StatsCards totalSpots={42} activeUsers={128} averageRating={4.8} responseTime="2.3s" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Live Map
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
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
                <p className="text-sm text-gray-600">Smart predictions • Real-time updates • Grok AI powered</p>
              </div>
              <div className="h-[calc(600px-80px)]">
                <EnhancedParkingMap onSpotSelect={setSelectedSpot} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <UserProfileEnhanced user={user} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ParkingHistory />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <SmartAssistant />
            <RouteOptimizer />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AIAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <SmartNotifications />
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
                  <li>• Real-time sync features</li>
                </ul>
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">Upgrade Now - $9.99/month</Button>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
                <ul className="space-y-2 mb-6">
                  <li>• White-label solution</li>
                  <li>• Custom integrations</li>
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
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Authentication Provider</p>
                    <p className="text-gray-900">Supabase</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>
              <RecentActivity activities={mockActivities} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
