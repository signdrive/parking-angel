"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation, Clock, DollarSign, MapPin, Zap, TrendingUp, Route, Brain } from "lucide-react"

export function RouteOptimizer() {
  const [destination, setDestination] = useState("")
  const [arrivalTime, setArrivalTime] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimization, setOptimization] = useState<any>(null)

  const optimizeRoute = async () => {
    setIsOptimizing(true)

    // Simulate AI optimization
    setTimeout(() => {
      setOptimization({
        recommendedRoute: {
          duration: "23 minutes",
          distance: "8.4 miles",
          traffic: "Light",
          savings: "$4.50",
          confidence: 94,
        },
        parkingSpot: {
          name: "Smart Garage Downtown",
          distance: "0.1 miles from destination",
          price: "$3.50/hour",
          availability: "High",
          walkTime: "2 minutes",
        },
        alternatives: [
          {
            name: "Alternative Route A",
            duration: "26 minutes",
            savings: "$2.00",
            confidence: 87,
          },
          {
            name: "Alternative Route B",
            duration: "21 minutes",
            savings: "$1.50",
            confidence: 79,
          },
        ],
        aiInsights: [
          "Traffic is 15% lighter on the recommended route",
          "Parking availability peaks at your arrival time",
          "This route avoids 2 construction zones",
          "You'll save 8 minutes compared to your usual route",
        ],
      })
      setIsOptimizing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-6 h-6 text-blue-600" />
            AI Route Optimizer
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Brain className="w-3 h-3 mr-1" />
              Neural Network
            </Badge>
          </CardTitle>
          <CardDescription>Advanced AI that optimizes your entire journey from departure to parking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Destination</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination address..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Arrival Time</label>
                <Input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
              </div>
            </div>

            <Button onClick={optimizeRoute} disabled={!destination || !arrivalTime || isOptimizing} className="w-full">
              {isOptimizing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI Optimizing Route...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Optimize with AI
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {optimization && (
        <div className="space-y-6">
          {/* Main Recommendation */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-5 h-5" />
                AI Recommended Route
                <Badge className="bg-green-600 text-white">
                  {optimization.recommendedRoute.confidence}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-800">Route Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>{optimization.recommendedRoute.duration}</span>
                      <Badge variant="outline" className="text-xs">
                        {optimization.recommendedRoute.traffic} Traffic
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-green-600" />
                      <span>{optimization.recommendedRoute.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Save {optimization.recommendedRoute.savings}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-green-800">Recommended Parking</h4>
                  <div className="space-y-2">
                    <div className="font-medium">{optimization.parkingSpot.name}</div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{optimization.parkingSpot.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        <span>{optimization.parkingSpot.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{optimization.parkingSpot.walkTime} walk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">AI Insights</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {optimization.aiInsights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Brain className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alternative Routes</CardTitle>
              <CardDescription>Other AI-analyzed options for comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimization.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{alt.name}</div>
                        <div className="text-sm text-gray-600">
                          {alt.duration} • Save {alt.savings}
                        </div>
                      </div>
                      <Badge variant="outline">{alt.confidence}% Confidence</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              Start Navigation
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="w-4 h-4 mr-2" />
              Reserve Parking
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
