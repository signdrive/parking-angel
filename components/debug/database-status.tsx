"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Activity } from "lucide-react"
import { DatabaseEmergencyRecovery } from "@/lib/database-emergency-recovery"

interface DatabaseHealth {
  healthy: boolean
  status: string
  responseTime: number
  error?: string
}

export function DatabaseStatus() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const recovery = DatabaseEmergencyRecovery.getInstance()

  const checkHealth = async () => {
    setChecking(true)
    try {
      const healthStatus = await recovery.checkDatabaseHealth()
      setHealth(healthStatus)
      setLastCheck(new Date())
    } catch (error) {
      setHealth({
        healthy: false,
        status: "Check Failed",
        responseTime: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()

    // Listen for health updates
    const handleHealthUpdate = (event: CustomEvent) => {
      setHealth(event.detail)
      setLastCheck(new Date())
    }

    if (typeof window !== "undefined") {
      window.addEventListener("database-health-update", handleHealthUpdate as EventListener)
      recovery.startHealthMonitoring()
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("database-health-update", handleHealthUpdate as EventListener)
      }
      recovery.stopHealthMonitoring()
    }
  }, [])

  const getStatusIcon = () => {
    if (checking) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    if (!health) return <Activity className="w-5 h-5 text-gray-400" />
    if (health.healthy) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (checking) return <Badge variant="secondary">Checking...</Badge>
    if (!health) return <Badge variant="secondary">Unknown</Badge>
    if (health.healthy) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
    return <Badge variant="destructive">Unhealthy</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Database Status
        </CardTitle>
        <CardDescription>Real-time database health monitoring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {health && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Response Time:</span>
              <span className={`font-mono ${health.responseTime > 1000 ? "text-red-600" : "text-green-600"}`}>
                {health.responseTime}ms
              </span>
            </div>

            {health.error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error Details:</p>
                    <p className="text-sm text-red-800">{health.error}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {lastCheck && <div className="text-sm text-gray-500">Last checked: {lastCheck.toLocaleTimeString()}</div>}

        <Button onClick={checkHealth} disabled={checking} className="w-full">
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
          Check Now
        </Button>

        {health && !health.healthy && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">🚨 Database Issues Detected</h4>
            <p className="text-sm text-yellow-800 mb-3">
              Your Supabase database is experiencing issues. This could be due to:
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Supabase service outage</li>
              <li>Rate limiting or quota exceeded</li>
              <li>Network connectivity issues</li>
              <li>Database overload</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
