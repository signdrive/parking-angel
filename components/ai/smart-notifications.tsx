"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, Brain, DollarSign, TrendingUp, Zap } from "lucide-react"

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [settings, setSettings] = useState({
    aiPredictions: true,
    priceAlerts: true,
    availabilityAlerts: true,
    routeOptimization: true,
    behaviorInsights: false,
  })

  useEffect(() => {
    // Simulate AI-generated notifications
    setNotifications([
      {
        id: 1,
        type: "prediction",
        title: "High Demand Alert",
        message: "AI predicts 85% parking occupancy downtown in 2 hours. Consider leaving early or booking ahead.",
        confidence: 89,
        action: "Book Now",
        timestamp: "2 minutes ago",
        priority: "high",
      },
      {
        id: 2,
        type: "optimization",
        title: "Route Optimization Available",
        message: "New route discovered that saves 12 minutes and $4.50 for your usual commute.",
        confidence: 94,
        action: "Apply Route",
        timestamp: "15 minutes ago",
        priority: "medium",
      },
      {
        id: 3,
        type: "price",
        title: "Price Drop Detected",
        message: "Parking rates at Central Garage dropped 30%. Perfect time to book your regular spot.",
        confidence: 96,
        action: "View Deals",
        timestamp: "1 hour ago",
        priority: "medium",
      },
      {
        id: 4,
        type: "insight",
        title: "Behavior Pattern Insight",
        message: "You could save $23/week by shifting your arrival time 20 minutes earlier.",
        confidence: 87,
        action: "Learn More",
        timestamp: "3 hours ago",
        priority: "low",
      },
    ])
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case "optimization":
        return <Zap className="w-4 h-4 text-yellow-600" />
      case "price":
        return <DollarSign className="w-4 h-4 text-green-600" />
      case "insight":
        return <Brain className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-gray-200 bg-gray-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Smart Notification Settings
          </CardTitle>
          <CardDescription>Configure your AI-powered parking alerts and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Predictions</p>
                <p className="text-sm text-gray-600">Get alerts about future parking conditions</p>
              </div>
              <Switch
                checked={settings.aiPredictions}
                onCheckedChange={(checked) => setSettings({ ...settings, aiPredictions: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Alerts</p>
                <p className="text-sm text-gray-600">Notify when prices drop or surge</p>
              </div>
              <Switch
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, priceAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Availability Alerts</p>
                <p className="text-sm text-gray-600">Get notified about spot availability</p>
              </div>
              <Switch
                checked={settings.availabilityAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, availabilityAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Route Optimization</p>
                <p className="text-sm text-gray-600">Alerts about better routes and timing</p>
              </div>
              <Switch
                checked={settings.routeOptimization}
                onCheckedChange={(checked) => setSettings({ ...settings, routeOptimization: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Behavior Insights</p>
                <p className="text-sm text-gray-600">Weekly insights about your parking patterns</p>
              </div>
              <Switch
                checked={settings.behaviorInsights}
                onCheckedChange={(checked) => setSettings({ ...settings, behaviorInsights: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI-Generated Alerts
            <Badge className="bg-purple-100 text-purple-800">{notifications.length} Active</Badge>
          </CardTitle>
          <CardDescription>Smart notifications powered by machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 border rounded-lg ${getPriorityColor(notification.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {notification.confidence}% confidence
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <Badge
                    className={`text-xs ${
                      notification.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : notification.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {notification.priority} priority
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Dismiss
                    </Button>
                    <Button size="sm" className="text-xs h-7">
                      {notification.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts This Week</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">+15% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Taken</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">78% action rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-purple-600">$34.50</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">From AI alerts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
