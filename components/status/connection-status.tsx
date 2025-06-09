"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Database, AlertTriangle } from "lucide-react"
import { SupabaseCircuitBreaker } from "@/lib/supabase-circuit-breaker"

export function ConnectionStatus() {
  const [circuitState, setCircuitState] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const circuitBreaker = SupabaseCircuitBreaker.getInstance()

    const updateStatus = () => {
      setCircuitState(circuitBreaker.getState())
      setIsOnline(navigator.onLine)
    }

    updateStatus()

    const interval = setInterval(updateStatus, 5000)

    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
    }
  }, [])

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-500"
    if (!circuitState) return "bg-gray-500"

    switch (circuitState.state) {
      case "CLOSED":
        return "bg-green-500"
      case "HALF_OPEN":
        return "bg-yellow-500"
      case "OPEN":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline"
    if (!circuitState) return "Unknown"

    switch (circuitState.state) {
      case "CLOSED":
        return "Connected"
      case "HALF_OPEN":
        return "Testing"
      case "OPEN":
        return "Database Down"
      default:
        return "Unknown"
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />
    if (circuitState?.state === "OPEN") return <AlertTriangle className="w-4 h-4" />
    return <Database className="w-4 h-4" />
  }

  return (
    <Card className="fixed top-4 right-4 z-50 min-w-[200px]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
          {circuitState?.failures > 0 && (
            <Badge variant="outline" className="text-xs">
              {circuitState.failures} failures
            </Badge>
          )}
        </div>

        {circuitState?.state === "OPEN" && <div className="text-xs text-gray-600 mt-1">Using offline data</div>}
      </CardContent>
    </Card>
  )
}
