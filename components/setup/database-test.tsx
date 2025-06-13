"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Play } from "lucide-react"

interface TestResult {
  name: string
  success: boolean
  data: any
  error?: string
}

interface DatabaseTestResponse {
  success: boolean
  message: string
  tests: TestResult[]
  timestamp: string
}

export function DatabaseTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<DatabaseTestResponse | null>(null)

  const runDatabaseTests = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-database")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        message: "Failed to run database tests",
        tests: [],
        timestamp: new Date().toISOString(),
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">✓ Passed</Badge>
    ) : (
      <Badge variant="destructive">✗ Failed</Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Database Functionality Test
        </CardTitle>
        <CardDescription>Test all database tables, functions, and features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDatabaseTests} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Database Tests
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Overall Result</h3>
                  {getStatusBadge(results.success)}
                </div>
                <p className="text-sm text-gray-600">{results.message}</p>
                <p className="text-xs text-gray-500 mt-1">Tested at: {new Date(results.timestamp).toLocaleString()}</p>
              </div>

              {results.tests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.success)}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        {test.error && <p className="text-sm text-red-600">{test.error}</p>}
                      </div>
                    </div>
                    {getStatusBadge(test.success)}
                  </div>

                  {test.success && test.data && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium mb-1">Result:</p>
                      {Array.isArray(test.data) ? (
                        <p>{test.data.length} items found</p>
                      ) : typeof test.data === "object" ? (
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(test.data, null, 2)}</pre>
                      ) : (
                        <p>{String(test.data)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results?.success && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎉 Database Setup Complete!</h4>
              <p className="text-sm text-green-800">
                All database tables, functions, and features are working correctly. Your Park Algo app is ready to
                use!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
