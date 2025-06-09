"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react"

export function HeaderInspector() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testHeaders = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      // Test different header configurations
      const tests = [
        {
          name: "Standard Headers",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
        {
          name: "PostgREST Headers",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Profile": "public",
            "Content-Profile": "public",
          },
        },
        {
          name: "Minimal Headers",
          headers: {
            Accept: "application/json",
          },
        },
        {
          name: "Browser Headers",
          headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
          },
        },
      ]

      const results = []

      for (const test of tests) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/parking_spots?select=id&limit=1`,
            {
              method: "GET",
              headers: {
                ...test.headers,
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
              },
            },
          )

          results.push({
            name: test.name,
            status: response.status,
            statusText: response.statusText,
            headers: test.headers,
            success: response.ok,
            responseHeaders: Object.fromEntries(response.headers.entries()),
          })
        } catch (error) {
          results.push({
            name: test.name,
            status: 0,
            statusText: "Network Error",
            headers: test.headers,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      setTestResult(results)
    } catch (error) {
      console.error("Header test failed:", error)
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (result: any) => {
    if (result.success) {
      return (
        <Badge variant="default" className="bg-green-500">
          ✅ {result.status}
        </Badge>
      )
    } else if (result.status === 406) {
      return <Badge variant="destructive">❌ 406 Not Acceptable</Badge>
    } else {
      return <Badge variant="destructive">❌ {result.status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Header Inspector
        </CardTitle>
        <CardDescription>Test different header configurations to identify the 406 error cause</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testHeaders} disabled={loading} className="w-full">
          {loading ? "Testing Headers..." : "Test Header Configurations"}
        </Button>

        {testResult && Array.isArray(testResult) && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Header Test Results:</strong> Compare which headers work vs cause 406 errors
              </AlertDescription>
            </Alert>

            {testResult.map((result, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{result.name}</CardTitle>
                    {getStatusBadge(result)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Request Headers:</strong>
                      <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.headers, null, 2)}
                      </pre>
                    </div>
                    {result.responseHeaders && (
                      <div>
                        <strong>Response Headers:</strong>
                        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.responseHeaders, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {testResult && !Array.isArray(testResult) && testResult.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>Test failed: {testResult.error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Expected Result:</strong> Standard headers should return 200, PostgREST headers might cause 406
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
