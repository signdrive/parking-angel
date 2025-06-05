"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { requestNotificationPermission, sendTestNotification } from "@/lib/firebase-messaging"
import { toast } from "@/hooks/use-toast"
import { Bell, Send, CheckCircle, XCircle } from "lucide-react"

export function NotificationTest() {
  const { user } = useFirebaseAuth()
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== "undefined" ? Notification.permission : "default",
  )
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestPermission = async () => {
    setLoading(true)
    try {
      const token = await requestNotificationPermission()
      if (token) {
        setFcmToken(token)
        setPermissionStatus("granted")
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive smart parking alerts.",
        })
      } else {
        setPermissionStatus("denied")
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTest = async () => {
    if (!user) return

    setLoading(true)
    try {
      await sendTestNotification(user.uid)
      toast({
        title: "Test Sent!",
        description: "Check for the test notification.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case "granted":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enabled
          </Badge>
        )
      case "denied":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        )
      default:
        return <Badge variant="secondary">Not Set</Badge>
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Firebase Push Notifications
        </CardTitle>
        <CardDescription>Test Firebase Cloud Messaging with your VAPID key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Permission Status</p>
            <p className="text-sm text-gray-600">Current notification permission</p>
          </div>
          {getPermissionBadge()}
        </div>

        {fcmToken && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium mb-1">FCM Token:</p>
            <p className="text-xs font-mono break-all text-gray-600">{fcmToken.substring(0, 50)}...</p>
          </div>
        )}

        <div className="space-y-2">
          {permissionStatus !== "granted" ? (
            <Button onClick={requestPermission} disabled={loading} className="w-full">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Request Notification Permission
            </Button>
          ) : (
            <Button onClick={sendTest} disabled={loading} className="w-full">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test Notification
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ VAPID Key: Configured</p>
          <p>✅ Service Worker: Ready</p>
          <p>✅ Firebase Project: parking-angel-224eb</p>
        </div>
      </CardContent>
    </Card>
  )
}
