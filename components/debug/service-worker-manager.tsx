"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"

export function ServiceWorkerManager() {
  const [swStatus, setSwStatus] = useState<string>("checking")
  const [swVersion, setSwVersion] = useState<string>("unknown")
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkServiceWorkerStatus()
  }, [])

  const checkServiceWorkerStatus = async () => {
    if (!("serviceWorker" in navigator)) {
      setSwStatus("not-supported")
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration) {
        setSwStatus("active")

        // Check for updates
        if (registration.waiting) {
          setUpdateAvailable(true)
        }

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          setUpdateAvailable(true)
        })
      } else {
        setSwStatus("not-registered")
      }
    } catch (error) {
      console.error("Service Worker check failed:", error)
      setSwStatus("error")
    }
  }

  const updateServiceWorker = async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration) {
        // Force update
        await registration.update()

        if (registration.waiting) {
          // Skip waiting and activate new SW
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }

        // Reload page to use new SW
        window.location.reload()
      }
    } catch (error) {
      console.error("Service Worker update failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const unregisterServiceWorker = async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration) {
        await registration.unregister()
        setSwStatus("not-registered")
        setUpdateAvailable(false)

        // Clear all caches
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))

        console.log("Service Worker unregistered and caches cleared")
      }
    } catch (error) {
      console.error("Service Worker unregister failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (swStatus) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "not-registered":
      case "not-supported":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <RefreshCw className="w-5 h-5 animate-spin" />
    }
  }

  const getStatusBadge = () => {
    switch (swStatus) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "not-registered":
        return <Badge variant="destructive">Not Registered</Badge>
      case "not-supported":
        return <Badge variant="destructive">Not Supported</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Checking...</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Service Worker Manager
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>Manage Service Worker to fix 406 errors and Supabase interference</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updateAvailable && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>A new Service Worker version is available that fixes the 406 errors.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="text-sm">
            <strong>Status:</strong> {swStatus}
          </div>
          <div className="text-sm">
            <strong>Version:</strong> {swVersion}
          </div>
        </div>

        <div className="flex gap-2">
          {updateAvailable && (
            <Button onClick={updateServiceWorker} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Update SW
            </Button>
          )}

          <Button onClick={checkServiceWorkerStatus} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Check Status
          </Button>

          <Button onClick={unregisterServiceWorker} variant="destructive" disabled={loading}>
            <XCircle className="w-4 h-4 mr-2" />
            Unregister
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Fix for 406 Errors:</strong> The updated Service Worker v8 excludes all Supabase requests,
            preventing interference and content negotiation issues.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
