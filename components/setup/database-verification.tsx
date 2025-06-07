"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function DatabaseVerification() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/database-test")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run database test")
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const renderTestResult = (test: any, name: string) => {
    if (!test) return null

    return (
      <div className="flex items-start gap-2 mb-2">
        {test.success ? (
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        <div>
          <p className="font-medium">{name}</p>
          {test.error && <p className="text-sm text-red-500">{JSON.stringify(test.error)}</p>}
          {test.data && (
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-24 overflow-auto">
              {JSON.stringify(test.data, null, 2)}
            </pre>
          )}
          {test.count !== undefined && <p className="text-sm">Found {test.count} parking spots</p>}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Verification</CardTitle>
        <CardDescription>Verify that the parking database tables are working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : results ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Results</h3>
            {renderTestResult(results.tests.spotDetails, "Parking Spot Details")}
            {renderTestResult(results.tests.availabilityStatus, "Availability Status")}
            {renderTestResult(results.tests.usageHistory, "Usage History")}
            {renderTestResult(results.tests.spotCount, "Spot Count")}

            <Alert className={results.success ? "bg-green-50" : "bg-red-50"}>
              <div className="flex items-center gap-2">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <AlertTitle>
                  {results.success ? "Database is working correctly" : "Database issues detected"}
                </AlertTitle>
              </div>
              <AlertDescription>
                {results.success
                  ? "All database queries are working as expected."
                  : "Some database queries failed. Check the details above."}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button onClick={runTest} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Run Database Test"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
