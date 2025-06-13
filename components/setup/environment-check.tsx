"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/supabase"

export function EnvironmentCheck() {
  const [copied, setCopied] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mapboxConfigured, setMapboxConfigured] = useState(false)
  const [checkingMapbox, setCheckingMapbox] = useState(true)

  useEffect(() => {
    setMounted(true)

    // Check if Mapbox is configured by testing the API endpoint
    const checkMapbox = async () => {
      try {
        const response = await fetch("/api/mapbox/status")
        if (response.ok) {
          const data = await response.json()
          setMapboxConfigured(data.configured)
        } else {
          setMapboxConfigured(false)
        }
      } catch {
        setMapboxConfigured(false)
      } finally {
        setCheckingMapbox(false)
      }
    }

    checkMapbox()
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>Loading configuration status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const checks = [
    {
      name: "Supabase URL",
      key: "NEXT_PUBLIC_SUPABASE_URL",
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
      example: "https://your-project.supabase.co",
    },
    {
      name: "Supabase Anon Key",
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    {
      name: "Mapbox Token",
      key: "MAPBOX_ACCESS_TOKEN",
      configured: mapboxConfigured,
      required: true,
      example: "pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV...",
      checking: checkingMapbox,
    },
  ]

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getStatusIcon = (configured: boolean, required: boolean, checking?: boolean) => {
    if (checking) {
      return <div className="w-5 h-5 rounded-full bg-blue-300 animate-pulse" />
    }
    if (configured) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (required) {
      return <XCircle className="w-5 h-5 text-red-600" />
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (configured: boolean, required: boolean, checking?: boolean) => {
    if (checking) {
      return <Badge variant="secondary">Checking...</Badge>
    }
    if (configured) {
      return <Badge className="bg-green-100 text-green-800">✓ Configured</Badge>
    } else if (required) {
      return <Badge variant="destructive">Missing</Badge>
    } else {
      return <Badge variant="secondary">Optional</Badge>
    }
  }

  const allRequired = checks.filter((check) => check.required).every((check) => check.configured)
  const supabaseConfigured = isSupabaseConfigured()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allRequired ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          Environment Configuration
        </CardTitle>
        <CardDescription>
          {allRequired
            ? "All required environment variables are configured correctly."
            : "Some required environment variables are missing. Please configure them to use all features."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => (
            <div key={check.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.configured, check.required, check.checking)}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-gray-500">{check.key}</p>
                  </div>
                </div>
                {getStatusBadge(check.configured, check.required, check.checking)}
              </div>

              {check.configured && !check.checking && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                  ✓ Environment variable is set
                </div>
              )}

              {!check.configured && !check.checking && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">Add this environment variable:</p>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <code className="text-xs flex-1 font-mono">
                      {check.key}={check.example}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${check.key}=`, check.key)}>
                      {copied === check.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {supabaseConfigured && !mapboxConfigured && !checkingMapbox && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">✅ Supabase Configured!</h4>
            <p className="text-sm text-blue-800 mb-3">Great! Your Supabase database is connected. Now you need to:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside mb-3">
              <li>Add the MAPBOX_ACCESS_TOKEN environment variable</li>
              <li>Run the database setup scripts</li>
            </ol>
            <Button size="sm" variant="outline" asChild>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Get Mapbox Token <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        )}

        {!supabaseConfigured && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Setup Required</h4>
            <p className="text-sm text-red-800 mb-3">Please add the Supabase integration to continue:</p>
            <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
              <li>Click "Add Supabase integration" below</li>
              <li>Follow the setup wizard</li>
              <li>Run the database scripts</li>
            </ol>
          </div>
        )}

        {allRequired && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🎉 All Set!</h4>
            <p className="text-sm text-green-800">
              All environment variables are configured. You can now use all features of Park Algo!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
