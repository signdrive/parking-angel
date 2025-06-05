"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Smartphone, Clock, MapPin, TrendingUp, Zap } from "lucide-react"

export function SmartNotifications() {
  const [notifications, setNotifications] = useState({
    spotAvailable: true,
    priceAlerts: true,
    timeReminders: false,
    trafficUpdates: true,
    aiRecommendations: true,
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Smart Notification Center
            <Badge className="bg-blue-100 text-blue-800">AI POWERED</Badge>
          </CardTitle>
          <CardDescription>Intelligent alerts powered by machine learning and real-time data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Spot Available Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when parking opens near your destination</p>
                </div>
              </div>
              <Switch
                checked={notifications.spotAvailable}
                onCheckedChange={() => toggleNotification("spotAvailable")}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Price Drop Alerts</p>
                  <p className="text-sm text-gray-600">AI detects when parking prices drop in your area</p>
                </div>
              </div>
              <Switch checked={notifications.priceAlerts} onCheckedChange={() => toggleNotification("priceAlerts")} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Time Reminders</p>
                  <p className="text-sm text-gray-600">Smart reminders before your parking expires</p>
                </div>
              </div>
              <Switch
                checked={notifications.timeReminders}
                onCheckedChange={() => toggleNotification("timeReminders")}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Traffic Updates</p>
                  <p className="text-sm text-gray-600">Real-time traffic affecting parking availability</p>
                </div>
              </div>
              <Switch
                checked={notifications.trafficUpdates}
                onCheckedChange={() => toggleNotification("trafficUpdates")}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium">AI Recommendations</p>
                  <p className="text-sm text-gray-600">Personalized parking suggestions based on your patterns</p>
                </div>
              </div>
              <Switch
                checked={notifications.aiRecommendations}
                onCheckedChange={() => toggleNotification("aiRecommendations")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Spot Available</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">2 min ago</Badge>
                </div>
                <p className="text-sm text-green-800">Parking spot opened 0.2 miles from your destination</p>
              </div>

              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Price Alert</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">15 min ago</Badge>
                </div>
                <p className="text-sm text-blue-800">Parking rates dropped 30% in downtown area</p>
              </div>

              <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Recommendation</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">1 hour ago</Badge>
                </div>
                <p className="text-sm text-purple-800">Based on your schedule, park at Mall Garage for best value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notification Frequency</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>Real-time</option>
                  <option>Every 5 minutes</option>
                  <option>Every 15 minutes</option>
                  <option>Hourly</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Quiet Hours</label>
                <div className="flex gap-2 mt-1">
                  <input type="time" className="flex-1 p-2 border rounded-md" defaultValue="22:00" />
                  <span className="self-center">to</span>
                  <input type="time" className="flex-1 p-2 border rounded-md" defaultValue="07:00" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Distance Threshold</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>Within 0.1 miles</option>
                  <option>Within 0.25 miles</option>
                  <option>Within 0.5 miles</option>
                  <option>Within 1 mile</option>
                </select>
              </div>

              <Button className="w-full">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced AI Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Predictive Notifications</h4>
              <p className="text-sm text-gray-700">
                AI predicts when you'll need parking based on your calendar, location history, and traffic patterns. Get
                proactive alerts before you even start looking.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Smart Timing</h4>
              <p className="text-sm text-gray-700">
                Machine learning optimizes notification timing to avoid spam while ensuring you never miss important
                parking opportunities.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Contextual Awareness</h4>
              <p className="text-sm text-gray-700">
                Notifications adapt to your context - different alerts for work commutes, shopping trips, or special
                events based on your behavior patterns.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Multi-Channel Delivery</h4>
              <p className="text-sm text-gray-700">
                Smart delivery across push notifications, SMS, email, and in-app alerts based on urgency and your
                preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
