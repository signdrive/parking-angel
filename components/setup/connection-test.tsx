"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase/browser"

const getSupabase = () => getBrowserClient()

interface ConnectionStatus {
  supabase: "testing" | "connected" | "error" | "not-configured"
  mapbox: "testing" | "connected" | "error" | "not-configured"
  supabaseError?: string
  mapboxError?: string
}

export function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: "not-configured",
    mapbox: "not-configured",
  })
  const [testing, setTesting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testConnections = async () => {
    setTesting(true)
    setStatus({ supabase: "testing", mapbox: "testing" })

    // Test Supabase connection
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (hasSupabase) {
      try {
        const { data, error } = await getSupabase().from("profiles").select("count").limit(1)
        if (error && error.message !== "Supabase not configured") {
          setStatus((prev) => ({
            ...prev,
            supabase: "error",
            supabaseError: error.message,
          }))
        } else {
          setStatus((prev) => ({ ...prev, supabase: "connected" }))
        }
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          supabase: "error",
          supabaseError: "Connection failed",
        }))
      }
    } else {
      setStatus((prev) => ({
        ...prev,
        supabase: "not-configured",
        supabaseError: "Environment variables not set",
      }))
    }

    // Test Mapbox token via API endpoint
    try {
      const response = await fetch("/api/mapbox/token")
      if (response.ok) {
        const data = await response.json()
        if (data.token) {
          // Test the token with a simple API call
          const testResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${data.token}`,
          )
          if (testResponse.ok) {
            setStatus((prev) => ({ ...prev, mapbox: "connected" }))
          } else {
            setStatus((prev) => ({
              ...prev,
              mapbox: "error",
              mapboxError: "Invalid token or API error",
            }))
          }
        } else {
          setStatus((prev) => ({
            ...prev,
            mapbox: "error",
            mapboxError: "Token not available",
          }))
        }
      } else {
        setStatus((prev) => ({
          ...prev,
          mapbox: "not-configured",
          mapboxError: "Token not configured",
        }))
      }
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        mapbox: "error",
        mapboxError: "Connection failed",
      }))
    }

    setTesting(false)
  }

  useEffect(() => {
    if (mounted) {
      // Auto-test on mount if both services are configured
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (hasSupabase) {
        testConnections()
      } else {
        setStatus({
          supabase: "not-configured",
          mapbox: "not-configured",
          supabaseError: "Environment variables not set",
          mapboxError: "Token not configured",
        })
        setTesting(false)
      }
    }
  }, [mounted])

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "testing":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "not-configured":
        return <XCircle className="w-5 h-5 text-gray-400" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "not-configured":
        return <Badge variant="secondary">Not Configured</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Connection Status
          </CardTitle>
          <CardDescription>Loading connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-6 h-6" />
          Connection Status
        </CardTitle>
        <CardDescription>Test connections to external services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.supabase)}
              <div>
                <p className="font-medium">Supabase Database</p>
                <p className="text-sm text-gray-500">{status.supabaseError || "Authentication and data storage"}</p>
              </div>
            </div>
            {getStatusBadge(status.supabase)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.mapbox)}
              <div>
                <p className="font-medium">Mapbox Maps</p>
                <p className="text-sm text-gray-500">{status.mapboxError || "Interactive mapping service"}</p>
              </div>
            </div>
            {getStatusBadge(status.mapbox)}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={testConnections} disabled={testing} size="sm" variant="outline">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connections"
            )}
          </Button>
        </div>

        {status.supabase === "connected" && status.mapbox === "not-configured" && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Almost there!</strong> Supabase is connected. Add your Mapbox token to enable the interactive map.
            </p>
          </div>
        )}

        {status.supabase === "connected" && status.mapbox === "connected" && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Perfect!</strong> All services are connected and ready to use.
            </p>
          </div>
        )}

        {status.supabase === "not-configured" && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Setup needed:</strong> Please configure your Supabase environment variables first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
