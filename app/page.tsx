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
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
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
            Find Parking Spots in <span className="text-blue-600">Real-Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of drivers helping each other find parking. Report spots when you leave, discover available
            spaces when you arrive.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                Start Finding Spots
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
              <CardTitle>Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                See available parking spots updated in real-time by the community
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Help fellow drivers by reporting when you leave a parking spot
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Save Time</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Stop circling blocks looking for parking. Find spots instantly
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Reputation System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Build your reputation by providing accurate parking information
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold">Report When Leaving</h3>
              <p className="text-gray-600">Tap the report button when you're about to leave a parking spot</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold">Find Available Spots</h3>
              <p className="text-gray-600">View real-time available spots on the interactive map</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold">Build Reputation</h3>
              <p className="text-gray-600">Earn points for accurate reports and help the community grow</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Never Circle for Parking Again?</h2>
          <p className="text-gray-600 mb-6">Join the community of drivers making parking easier for everyone.</p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Parking Angel</span>
          </div>
          <p className="text-gray-600">© 2024 Parking Angel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
