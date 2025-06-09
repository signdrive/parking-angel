"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"

export function HeaderFixTester() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testFix = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log("🧪 Testing 406 header fix...")

      const response = await fetch("/api/test-406-fix")
      const data = await response.json()

      setResult({
        httpStatus: response.status,
        success: data.success,
        data: data.data,
        error: data.error,
        timestamp: data.timestamp,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>406 Error Fix Tester</CardTitle>
        <CardDescription>Test the fix for "Not Acceptable" errors with Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Issue Identified</AlertTitle>
          <AlertDescription>
            The 406 error was caused by the Accept header being set to{" "}
            <code className="bg-gray-100 px-1 rounded">application/vnd.pgrst.object+json</code> instead of{" "}
            <code className="bg-gray-100 px-1 rounded">application/json</code>
          </AlertDescription>
        </Alert>

        <Button onClick={testFix} disabled={testing} className="w-full">
          <RefreshCw className={`w-4 h-4 mr-2 ${testing ? "animate-spin" : ""}`} />
          Test 406 Fix
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-medium">Test Result</h3>
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.httpStatus ? `HTTP ${result.httpStatus}` : result.success ? "Success" : "Failed"}
              </Badge>
            </div>

            {result.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            {result.success && result.data && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Successfully retrieved parking spot data. The 406 error has been fixed!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Response Data:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            <div className="text-xs text-gray-500">Tested at: {result.timestamp}</div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">What was fixed:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Changed Accept header from <code>application/vnd.pgrst.object+json</code> to <code>application/json</code>
            </li>
            <li>Removed problematic PostgREST-specific headers</li>
            <li>Added custom fetch override to ensure correct headers</li>
            <li>Implemented fallback mechanisms for failed requests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
