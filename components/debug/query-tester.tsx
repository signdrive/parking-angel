"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function QueryTester() {
  const [testId, setTestId] = useState("google_ChIJK_xdmtxQw0cR1DFNPXOHZLc")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testQuery = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🧪 Testing query for ID:", testId)

      const response = await fetch(`/api/spots/${encodeURIComponent(testId)}`)
      const data = await response.json()

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const testGeneralQuery = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🧪 Testing general parking spots query")

      const response = await fetch("/api/spots?limit=5")
      const data = await response.json()

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Query Tester</CardTitle>
          <CardDescription>Test database queries to diagnose 406 errors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testId">Test Parking Spot ID</Label>
            <Input
              id="testId"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Enter parking spot ID"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testQuery} disabled={loading || !testId} className="flex-1">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Test Specific ID
            </Button>
            <Button onClick={testGeneralQuery} disabled={loading} variant="outline" className="flex-1">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Test General Query
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Query Result
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.status || (result.success ? "Success" : "Error")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error && (
              <Alert className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Response Data:</Label>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>

            <div className="text-xs text-gray-500 mt-2">Tested at: {result.timestamp}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
