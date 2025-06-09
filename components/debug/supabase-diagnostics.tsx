"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Info } from "lucide-react"

export function SupabaseDiagnostics() {
  const [testId, setTestId] = useState("google_ChIJK_xdmtxQw0cR1DFNPXOHZLc")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [headerInfo, setHeaderInfo] = useState<any>(null)
  const [generalResult, setGeneralResult] = useState<any>(null)

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
    setGeneralResult(null)

    try {
      console.log("🧪 Testing general parking spots query")

      const response = await fetch("/api/spots?limit=5")
      const data = await response.json()

      setGeneralResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setGeneralResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const checkHeaders = async () => {
    setLoading(true)
    setHeaderInfo(null)

    try {
      const response = await fetch("/api/debug/headers")
      const data = await response.json()

      setHeaderInfo({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setHeaderInfo({
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
          <CardTitle>Supabase Connection Diagnostics</CardTitle>
          <CardDescription>Diagnose and fix 406 Not Acceptable errors</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting 406 Errors</AlertTitle>
            <AlertDescription>
              This tool helps diagnose HTTP 406 errors when connecting to Supabase. It tests different query strategies
              and header configurations.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="specific" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specific">Specific ID</TabsTrigger>
              <TabsTrigger value="general">General Query</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
            </TabsList>

            <TabsContent value="specific" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testId">Test Parking Spot ID</Label>
                <Input
                  id="testId"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  placeholder="Enter parking spot ID"
                />
              </div>

              <Button onClick={testQuery} disabled={loading || !testId} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Test Specific ID
              </Button>

              {result && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="text-lg font-medium">Query Result</h3>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.status || (result.success ? "Success" : "Error")}
                    </Badge>
                  </div>

                  {result.error && (
                    <Alert variant="destructive" className="mb-4">
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4">
              <Button onClick={testGeneralQuery} disabled={loading} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Test General Query
              </Button>

              {generalResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {generalResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="text-lg font-medium">Query Result</h3>
                    <Badge variant={generalResult.success ? "default" : "destructive"}>
                      {generalResult.status || (generalResult.success ? "Success" : "Error")}
                    </Badge>
                  </div>

                  {generalResult.error && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{generalResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Response Data:</Label>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(generalResult.data, null, 2)}
                    </pre>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">Tested at: {generalResult.timestamp}</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="headers" className="space-y-4">
              <Button onClick={checkHeaders} disabled={loading} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Check Request Headers
              </Button>

              {headerInfo && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {headerInfo.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="text-lg font-medium">Headers Info</h3>
                    <Badge variant={headerInfo.success ? "default" : "destructive"}>
                      {headerInfo.status || (headerInfo.success ? "Success" : "Error")}
                    </Badge>
                  </div>

                  {headerInfo.error && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{headerInfo.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Headers Data:</Label>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(headerInfo.data, null, 2)}
                    </pre>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">Tested at: {headerInfo.timestamp}</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Common Causes of 406 Errors:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Incorrect Accept header in requests</li>
              <li>Row-Level Security (RLS) policies blocking access</li>
              <li>Missing or invalid API keys</li>
              <li>CORS configuration issues</li>
              <li>Malformed query parameters</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Solutions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure Accept: application/json header is set</li>
              <li>Check RLS policies in Supabase dashboard</li>
              <li>Verify API keys are correctly configured</li>
              <li>Add your domain to Supabase CORS allowed origins</li>
              <li>Simplify queries to isolate the issue</li>
            </ul>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              If specific queries fail but general ones work, the issue might be with how you're formatting the query
              parameters or with RLS policies for specific records.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
