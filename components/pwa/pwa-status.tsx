"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Download, Bell, BellOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check if installed as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    // Check notification permission
    setNotificationsEnabled(Notification.permission === "granted")

    // Listen for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          setUpdateAvailable(true)
        }
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleUpdate = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" })
        window.location.reload()
      }
    }
  }

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === "granted")

      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive parking alerts and updates",
        })
      }
    } catch (error) {

    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Online/Offline Status */}
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      {/* PWA Installation Status */}
      {isInstalled && (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Download className="w-3 h-3" />
          <span>Installed</span>
        </Badge>
      )}

      {/* Notification Status */}
      <Button
        variant="ghost"
        size="sm"
        onClick={enableNotifications}
        className={`p-1 ${notificationsEnabled ? "text-green-600" : "text-gray-400"}`}
        title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
      >
        {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </Button>

      {/* Update Available */}
      {updateAvailable && (
        <Button variant="outline" size="sm" onClick={handleUpdate} className="text-xs">
          Update Available
        </Button>
      )}
    </div>
  )
}
