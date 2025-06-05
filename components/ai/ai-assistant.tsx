"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, MapPin, Clock, TrendingUp, Send, Sparkles } from "lucide-react"

export function AIAssistant() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions] = useState([
    "Find parking near Times Square",
    "Best time to park downtown?",
    "Predict parking availability for tonight",
    "Cheapest parking in my area",
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    setQuery("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Parking Assistant
            <Badge className="bg-purple-100 text-purple-800">BETA</Badge>
          </CardTitle>
          <CardDescription>Get intelligent parking recommendations powered by machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about parking..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">High Availability Zone</p>
                <p className="text-sm text-blue-700">Downtown area has 85% availability</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Best Value</p>
                <p className="text-sm text-green-700">$2/hour parking 0.3 miles away</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Timing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Peak Hours</p>
                <p className="text-sm text-orange-700">Avoid 8-10 AM, 5-7 PM</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">Optimal Time</p>
                <p className="text-sm text-purple-700">Best availability at 2 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Next Hour</p>
                <p className="text-sm text-green-700">92% chance of finding parking</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-900">Weekend Forecast</p>
                <p className="text-sm text-yellow-700">High demand expected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Predictive Analytics</h4>
              <p className="text-sm text-gray-600">
                Machine learning algorithms predict parking availability based on historical data, events, and real-time
                patterns.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Smart Route Optimization</h4>
              <p className="text-sm text-gray-600">
                AI-powered routing considers traffic, parking availability, and walking distance to find the optimal
                path.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Behavioral Learning</h4>
              <p className="text-sm text-gray-600">
                The system learns from user preferences and parking patterns to provide personalized recommendations.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Dynamic Pricing Insights</h4>
              <p className="text-sm text-gray-600">
                Real-time analysis of parking prices across different areas to help you find the best deals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
