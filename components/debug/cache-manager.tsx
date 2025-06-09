"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CacheInfo {
  name: string
  size: number
  entries: number
  lastModified?: string
}

export function CacheManager() {
  const [caches, setCaches] = useState<CacheInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [swStatus, setSwStatus] = useState<"loading" | "active" | "error" | "none">("loading")

  useEffect(() => {
    checkServiceWorkerStatus()
    loadCacheInfo()
  }, [])

  const checkServiceWorkerStatus = async () => {
    if (!("serviceWorker" in navigator)) {
      setSwStatus("none")
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.active) {
        setSwStatus("active")
      } else {
        setSwStatus("error")
      }
    } catch (error) {
      console.error("Service worker check failed:", error)
      setSwStatus("error")
    }
  }

  const loadCacheInfo = async () => {
    if (!("caches" in window)) {
      return
    }

    setLoading(true)
    try {
      const cacheNames = await caches.keys()
      const cacheInfos: CacheInfo[] = []

      for (const name of cacheNames) {
        try {
          const cache = await caches.open(name)
          const keys = await cache.keys()

          cacheInfos.push({
            name,
            size: 0, // We can't easily get size without iterating through all responses
            entries: keys.length,
          })
        } catch (error) {
          console.warn(`Failed to inspect cache ${name}:`, error)
          cacheInfos.push({
            name,
            size: -1,
            entries: -1,
          })
        }
      }

      setCaches(cacheInfos)
    } catch (error) {
      console.error("Failed to load cache info:", error)
      toast({
        title: "Cache Error",
        description: "Failed to load cache information. Try clearing site data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearAllCaches = async () => {
    if (!("caches" in window)) {
      return
    }

    setLoading(true)
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))

      toast({
        title: "Caches Cleared",
        description: "All caches have been cleared successfully.",
      })

      await loadCacheInfo()
    } catch (error) {
      console.error("Failed to clear caches:", error)
      toast({
        title: "Clear Failed",
        description: "Failed to clear caches. Try using browser DevTools.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearSpecificCache = async (cacheName: string) => {
    setLoading(true)
    try {
      await caches.delete(cacheName)
      toast({
        title: "Cache Cleared",
        description: `Cache "${cacheName}" has been cleared.`,
      })
      await loadCacheInfo()
    } catch (error) {
      console.error(`Failed to clear cache ${cacheName}:`, error)
      toast({
        title: "Clear Failed",
        description: `Failed to clear cache "${cacheName}".`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        toast({
          title: "Service Worker Updated",
          description: "Service worker has been updated. Refresh the page to apply changes.",
        })
      }
    } catch (error) {
      console.error("Failed to update service worker:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update service worker.",
        variant: "destructive",
      })
    }
  }

  const cleanupCache = async () => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.active) {
        registration.active.postMessage({ type: "CLEANUP_CACHE" })
        toast({
          title: "Cache Cleanup",
          description: "Cache cleanup initiated. This may take a moment.",
        })

        // Reload cache info after a delay
        setTimeout(loadCacheInfo, 2000)
      }
    } catch (error) {
      console.error("Failed to cleanup cache:", error)
      toast({
        title: "Cleanup Failed",
        description: "Failed to initiate cache cleanup.",
        variant: "destructive",
      })
    }
  }

  const clearSiteData = () => {
    toast({
      title: "Clear Site Data",
      description: "Open DevTools > Application > Storage > Clear site data to resolve cache issues.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Cache Manager
          </CardTitle>
          <CardDescription>Manage browser caches and resolve cache-related issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Worker Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">Service Worker Status:</span>
              {swStatus === "active" && <CheckCircle className="w-4 h-4 text-green-500" />}
              {swStatus === "error" && <XCircle className="w-4 h-4 text-red-500" />}
              {swStatus === "none" && <XCircle className="w-4 h-4 text-gray-500" />}
              {swStatus === "loading" && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Badge variant={swStatus === "active" ? "default" : "destructive"}>
                {swStatus === "active" ? "Active" : swStatus === "none" ? "Not Supported" : "Error"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={updateServiceWorker}>
              Update SW
            </Button>
          </div>

          {/* Cache Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadCacheInfo} disabled={loading} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={clearAllCaches} disabled={loading} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Caches
            </Button>
            <Button onClick={cleanupCache} disabled={loading} variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Cleanup Cache
            </Button>
            <Button onClick={clearSiteData} variant="outline">
              Clear Site Data
            </Button>
          </div>

          {/* Cache List */}
          <div className="space-y-2">
            <h3 className="font-medium">Current Caches ({caches.length})</h3>
            {caches.length === 0 ? (
              <p className="text-sm text-gray-500">No caches found</p>
            ) : (
              caches.map((cache) => (
                <div key={cache.name} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-mono text-sm">{cache.name}</span>
                    <div className="text-xs text-gray-500">
                      {cache.entries >= 0 ? `${cache.entries} entries` : "Error reading cache"}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => clearSpecificCache(cache.name)} disabled={loading}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Cache Issues:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Try "Cleanup Cache" first for automatic maintenance</li>
              <li>If issues persist, use "Clear All Caches"</li>
              <li>For persistent problems, use "Clear Site Data" in DevTools</li>
              <li>Refresh the page after clearing caches</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
