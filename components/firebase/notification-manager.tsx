"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { requestNotificationPermission, onMessageListener, subscribeToNotifications, NotificationPayload } from "@/lib/firebase-messaging"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"

export function NotificationManager() {
  const { user } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are already enabled
    setNotificationsEnabled(Notification.permission === "granted")    // Listen for foreground messages
    const unsubscribe = onMessageListener((payload: NotificationPayload) => {
      toast({
        title: payload.notification?.title || "New Notification",
        description: payload.notification?.body || "You have a new parking update",
      })
    })

    return unsubscribe
  }, [])

  const enableNotifications = async () => {
    if (!user) return    setLoading(true)
    try {
      const granted = await requestNotificationPermission()
      if (granted) {
        await subscribeToNotifications(user.id)
        setNotificationsEnabled(true)
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive smart parking alerts!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Button
      onClick={enableNotifications}
      disabled={notificationsEnabled || loading}
      variant={notificationsEnabled ? "outline" : "default"}
      size="sm"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : notificationsEnabled ? (
        <Bell className="w-4 h-4 mr-2" />
      ) : (
        <BellOff className="w-4 h-4 mr-2" />
      )}
      {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
    </Button>
  )
}
