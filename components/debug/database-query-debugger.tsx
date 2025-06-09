"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface QueryTest {
  name: string
  query: () => Promise<any>
  description: string
}

export function DatabaseQueryDebugger() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const queryTests: QueryTest[] = [
    {
      name: "Table Structure Check",
      description: "Verify parking_spots table exists and check its structure",
      query: async () => {
        const { data, error } = await supabase.from("parking_spots").select("*").limit(1)
        return { data, error, count: data?.length || 0 }
      },
    },
    {
      name: "Count All Parking Spots",
      description: "Get total count of parking spots",
      query: async () => {
        const { count, error } = await supabase.from("parking_spots").select("*", { count: "exact", head: true })
        return { count, error }
      },
    },
    {
      name: "Sample Parking Spots",
      description: "Fetch first 5 parking spots",
      query: async () => {
        const { data, error } = await supabase
          .from("parking_spots")
          .select("id, latitude, longitude, spot_type, address, is_available")
          .limit(5)
        return { data, error, count: data?.length || 0 }
      },
    },
    {
      name: "Check Specific ID Format",
      description: "Test if the failing IDs exist in database",
      query: async () => {
        const testIds = ["google_ChIJAZFO6X9Rw0cRPMnHnH_dm54", "osm_1180649490", "osm_223128866"]

        const results = []
        for (const id of testIds) {
          const { data, error } = await supabase
            .from("parking_spots")
            .select("id, spot_type")
            .eq("id", id)
            .maybeSingle()

          results.push({ id, exists: !!data, error: error?.message })
        }
        return { results }
      },
    },
    {
      name: "RLS Policy Check",
      description: "Test if Row Level Security is blocking queries",
      query: async () => {
        // Test with different auth states
        const { data: publicData, error: publicError } = await supabase.from("parking_spots").select("count").limit(1)

        return {
          publicAccess: !publicError,
          publicError: publicError?.message,
          publicData: publicData?.length || 0,
        }
      },
    },
    {
      name: "Database Connection Test",
      description: "Test basic database connectivity",
      query: async () => {
        const { data, error } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .limit(5)

        return {
          connected: !error,
          error: error?.message,
          tables: data?.map((t) => t.table_name) || [],
        }
      },
    },
  ]

  const runAllTests = async () => {
    setTesting(true)
    setResults([])

    const testResults = []

    for (const test of queryTests) {
      try {
        console.log(`Running test: ${test.name}`)
        const result = await test.query()
        testResults.push({
          name: test.name,
          description: test.description,
          success: !result.error,
          result,
          error: result.error?.message,
        })
      } catch (error) {
        testResults.push({
          name: test.name,
          description: test.description,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          result: null,
        })
      }
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Database Query Debugger
        </CardTitle>
        <CardDescription>Diagnose the HTTP 400 errors from parking_spots table queries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runAllTests} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Run Database Diagnostics
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Diagnostic Results</h3>

              {results.map((result, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm text-gray-600">{result.description}</p>
                        </div>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✓ Pass" : "✗ Fail"}
                      </Badge>
                    </div>

                    {result.error && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}

                    {result.success && result.result && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(result.result, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🔍 Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• If table structure fails: Run the database setup scripts</li>
                  <li>• If RLS blocks access: Check Row Level Security policies</li>
                  <li>• If IDs don't exist: The app is querying non-existent records</li>
                  <li>• If connection fails: Check Supabase configuration</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
