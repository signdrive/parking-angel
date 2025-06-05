"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Clock, Star, AlertCircle } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"
import { EnvironmentCheck } from "@/components/setup/environment-check"
import { ConnectionTest } from "@/components/setup/connection-test"
import { ComprehensiveTest } from "@/components/setup/comprehensive-test"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Show setup if Supabase is not configured
    setShowSetup(!isSupabaseConfigured())
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Parking Angel</span>
            </div>
            <Button onClick={() => setShowSetup(false)} variant="outline">
              View App
            </Button>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Setup Required</h1>
              <p className="text-lg text-gray-600">
                Welcome to Parking Angel! Let's get your app configured and ready to use.
              </p>
            </div>

            <div className="space-y-6">
              <EnvironmentCheck />
              <ConnectionTest />
              <ComprehensiveTest />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Need help? Check out the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  setup documentation
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Parking Angel</span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              FIREBASE
            </span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/firebase-login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/firebase-signup">
              <Button>Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Supabase Login</Button>
            </Link>
            {!isSupabaseConfigured() && (
              <Button onClick={() => setShowSetup(true)} variant="outline">
                Setup
              </Button>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Parking Spots with <span className="text-blue-600">AI & Firebase</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of drivers using our AI-powered platform with Firebase authentication, real-time analytics,
            and smart notifications.
          </p>
          <div className="space-x-4">
            <Link href="/auth/firebase-signup">
              <Button size="lg" className="px-8 py-3">
                Start with Firebase
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8 py-3">
                View Live Map
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Firebase Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Secure authentication, real-time database, and advanced analytics with Firebase
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Google Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Seamless Google login with your Firebase project for enhanced user experience
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Real-time Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Live parking updates across all devices with Firebase Firestore real-time database
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Advanced user behavior tracking and insights with Firebase Analytics
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for Firebase-Powered Parking?</h2>
          <p className="text-gray-600 mb-6">
            Experience the next generation of parking apps with Firebase authentication and real-time features.
          </p>
          <div className="space-x-4">
            <Link href="/auth/firebase-signup">
              <Button size="lg" className="px-8 py-3">
                Get Started with Firebase
              </Button>
            </Link>
            <Link href="/auth/firebase-login">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Parking Angel</span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              FIREBASE
            </span>
          </div>
          <p className="text-gray-600">© 2024 Parking Angel. Powered by Firebase.</p>
        </div>
      </footer>
    </div>
  )
}
