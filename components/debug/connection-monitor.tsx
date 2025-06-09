"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, WifiOff, Check, AlertTriangle } from "lucide-react"

export function ConnectionMonitor() {
  const [status, setStatus] = useState<{
    connected: boolean
    latency?: number
    error?: string
    timestamp: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const checkConnection = async (reset = false) => {
    setLoading(true)
    try {
      const url = reset ? "/api/health/database?reset=true" : "/api/health/database"

      const response = await fetch(url)
      const data = await response.json()

      setStatus({
        connected: data.status === "healthy",
        latency: data.details?.latency,
        error: data.details?.error || data.error,
        timestamp: data.timestamp,
      })
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : "Failed to check connection",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const resetConnection = () => {
    checkConnection(true)
  }

  useEffect(() => {
    // Initial check
    checkConnection()

    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout | null = null

    if (autoRefresh) {
      interval = setInterval(() => {
        checkConnection()
      }, 30000) // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Connection Monitor
          </div>
          {status && (
            <Badge className={status.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {status.connected ? "Connected" : "Disconnected"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          {status && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {status.connected ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">{status.connected ? "Connection successful" : "Connection failed"}</span>
              </div>

              {status.latency && <div className="text-sm text-gray-600">Latency: {status.latency}ms</div>}

              {status.error && <div className="text-sm text-red-600">Error: {status.error}</div>}

              <div className="text-xs text-gray-500">Last checked: {new Date(status.timestamp).toLocaleString()}</div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => checkConnection()} disabled={loading} variant="outline" className="flex-1">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking..." : "Check Connection"}
            </Button>

            <Button onClick={resetConnection} disabled={loading} variant="outline" className="flex-1">
              Reset Connection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh every 30 seconds
            </label>
          </div>
        </div>

        {!status?.connected && (
          <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Connection Issues Detected</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  The application will continue to function using cached and offline data. Database connection will be
                  automatically retried.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
