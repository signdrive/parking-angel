"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSpotPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testServerSide = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-spot")
      const data = await response.json()
      setResult({ type: "server", data })
    } catch (error) {
      setResult({ type: "server", error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  const testClientSide = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        "https://vzhvpecwnjssurxbyzph.supabase.co/rest/v1/parking_spots?select=id,latitude,longitude,spot_type,address&limit=1",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult({ type: "client", data, status: response.status })
    } catch (error) {
      setResult({ type: "client", error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testServerSide} disabled={loading}>
              Test Server-Side
            </Button>
            <Button onClick={testClientSide} disabled={loading}>
              Test Client-Side (Patched)
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result ({result.type}):</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
