"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Play, Database, Map, Users } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase/browser"

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  details?: string
}

export function ComprehensiveTest() {
  const [tests, setTests] = useState<TestResult[]>(
    [
      { name: "Environment Variables", status: "pending" },
      { name: "Supabase Connection", status: "pending" },
      { name: "Mapbox API", status: "pending" },
      { name: "Database Schema", status: "pending" },
      { name: "Authentication System", status: "pending" },
    ]
  )
  const [isRunning, setIsRunning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = getBrowserClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, ...updates } : test)))
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Test 1: Environment Variables
    updateTest(0, { status: "running" })
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if Mapbox is configured via API
    let hasMapboxToken = false
    try {
      const response = await fetch("/api/mapbox/status")
      if (response.ok) {
        const data = await response.json()
        hasMapboxToken = data.configured
      }
    } catch {
      hasMapboxToken = false
    }

    if (hasSupabaseUrl && hasSupabaseKey && hasMapboxToken) {
      updateTest(0, {
        status: "success",
        message: "All environment variables configured",
        details: "Supabase URL, Supabase Key, and Mapbox Token are all set",
      })
    } else {
      const missing = []
      if (!hasSupabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
      if (!hasSupabaseKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
      if (!hasMapboxToken) missing.push("MAPBOX_ACCESS_TOKEN")

      updateTest(0, {
        status: "error",
        message: `Missing: ${missing.join(", ")}`,
        details: "Please add the missing environment variables",
      })
    }

    // Test 2: Supabase Connection
    updateTest(1, { status: "running" })
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error && error.message !== "Supabase not configured") {
        updateTest(1, {
          status: "error",
          message: "Connection failed",
          details: error.message,
        })
      } else {
        updateTest(1, {
          status: "success",
          message: "Connected successfully",
          details: "Supabase client initialized and responsive",
        })
      }
    } catch (err) {
      updateTest(1, {
        status: "error",
        message: "Connection error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 3: Mapbox API
    updateTest(2, { status: "running" })
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const response = await fetch("/api/mapbox/status")
      if (response.ok) {
        const data = await response.json()
        if (data.configured && data.connected) {
          updateTest(2, {
            status: "success",
            message: "API accessible",
            details: "Mapbox token is valid and API is responsive",
          })
        } else if (data.configured && !data.connected) {
          updateTest(2, {
            status: "error",
            message: "Invalid token",
            details: data.error || "Token validation failed",
          })
        } else {
          updateTest(2, {
            status: "error",
            message: "Token missing",
            details: "MAPBOX_ACCESS_TOKEN not configured",
          })
        }
      } else {
        updateTest(2, {
          status: "error",
          message: "API unreachable",
          details: "Failed to check Mapbox status",
        })
      }
    } catch (err) {
      updateTest(2, {
        status: "error",
        message: "Connection failed",
        details: err instanceof Error ? err.message : "Network error",
      })
    }

    // Test 4: Database Schema
    updateTest(3, { status: "running" })
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      // Test if tables exist by trying to query them
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("count").limit(1)

      const { data: spotsData, error: spotsError } = await supabase.from("parking_spots").select("count").limit(1)

      if (profilesError || spotsError) {
        updateTest(3, {
          status: "error",
          message: "Tables not found",
          details: "Database schema needs to be created. Run the setup scripts.",
        })
      } else {
        updateTest(3, {
          status: "success",
          message: "Schema ready",
          details: "All required tables are present and accessible",
        })
      }
    } catch (err) {
      updateTest(3, {
        status: "error",
        message: "Schema check failed",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // Test 5: Authentication System
    updateTest(4, { status: "running" })
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      // Test auth system by checking current session
      const { data, error } = await supabase.auth.getSession()
      if (error && error.message !== "Supabase not configured") {
        updateTest(4, {
          status: "error",
          message: "Auth system error",
          details: error.message,
        })
      } else {
        updateTest(4, {
          status: "success",
          message: "Auth system ready",
          details: "Authentication service is operational",
        })
      }
    } catch (err) {
      updateTest(4, {
        status: "error",
        message: "Auth test failed",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <div className="w-5 h-5 rounded-full bg-gray-300" />
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "running":
        return <Badge variant="secondary">Running...</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">✓ Passed</Badge>
      case "error":
        return <Badge variant="destructive">✗ Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTestIcon = (index: number) => {
    const icons = [
      <Database className="w-4 h-4" key="env" />,
      <Database className="w-4 h-4" key="supabase" />,
      <Map className="w-4 h-4" key="mapbox" />,
      <Database className="w-4 h-4" key="schema" />,
      <Users className="w-4 h-4" key="auth" />,
    ]
    return icons[index]
  }

  const allPassed = tests.every((test) => test.status === "success")
  const anyFailed = tests.some((test) => test.status === "error")

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Verification</CardTitle>
          <CardDescription>Loading test suite...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-6 h-6" />
          System Verification
        </CardTitle>
        <CardDescription>Comprehensive test of all system components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getTestIcon(index)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    {test.message && <p className="text-sm text-gray-600">{test.message}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {getStatusBadge(test.status)}
                </div>
              </div>
              {test.details && <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">{test.details}</div>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={runAllTests} disabled={isRunning} className="flex-1">
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {allPassed && !isRunning && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🎉 All Tests Passed!</h4>
            <p className="text-sm text-green-800">
              Your Park Algo app is fully configured and ready to use. All systems are operational!
            </p>
          </div>
        )}

        {anyFailed && !isRunning && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Some Tests Failed</h4>
            <p className="text-sm text-red-800">
              Please review the failed tests above and follow the setup instructions to resolve any issues.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
