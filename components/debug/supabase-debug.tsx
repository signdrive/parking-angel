"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SupabaseDebug() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const checkEnvVars = () => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return {
      hasUrl,
      hasKey,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }

  const envCheck = checkEnvVars()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Panel</h1>

      {/* Environment Variables Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
              <Badge variant={envCheck.hasUrl ? "default" : "destructive"}>
                {envCheck.hasUrl ? "✓ Present" : "✗ Missing"}
              </Badge>
              {envCheck.hasUrl && (
                <span className="text-sm text-gray-600">{envCheck.urlValue?.substring(0, 50)}...</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <Badge variant={envCheck.hasKey ? "default" : "destructive"}>
                {envCheck.hasKey ? "✓ Present" : "✗ Missing"}
              </Badge>
              {envCheck.hasKey && (
                <span className="text-sm text-gray-600">{envCheck.keyValue?.substring(0, 20)}...</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testConnection} disabled={testing} className="mb-4">
            {testing ? "Testing..." : "Test Supabase Connection"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "✓ Success" : "✗ Failed"}
                </Badge>
                <span className="font-medium">{result.success ? "Connection successful!" : "Connection failed"}</span>
              </div>

              {result.error && (
                <div className="text-sm text-red-700 mb-2">
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {result.details && (
                <div className="text-sm">
                  <strong>Details:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Check Environment Variables:</strong>
              <p>Make sure these are set in your environment:</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
              </code>
            </div>

            <div>
              <strong>2. Restart Development Server:</strong>
              <p>After adding environment variables, restart your dev server:</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">npm run dev</code>
            </div>

            <div>
              <strong>3. Check Supabase Project:</strong>
              <p>Verify your Supabase project is active and the API keys are correct.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
