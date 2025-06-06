"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, DollarSign, Clock, Zap, Target, BarChart3 } from "lucide-react"

export function AIAnalyticsDashboard() {
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI analytics loading
    setTimeout(() => {
      setInsights({
        personalizedMetrics: {
          totalSavings: 127.5,
          timeOptimized: 45,
          carbonFootprintReduced: 12.3,
          aiAccuracy: 94,
        },
        predictions: [
          {
            title: "Peak Hour Avoidance",
            description: "AI suggests leaving 15 minutes earlier to avoid 30% price surge",
            confidence: 92,
            impact: "high",
            savings: "$8.50",
          },
          {
            title: "Alternative Route Discovery",
            description: "New route found that saves 8 minutes and $3.00 per trip",
            confidence: 87,
            impact: "medium",
            savings: "$3.00",
          },
          {
            title: "Seasonal Pattern Alert",
            description: "Holiday shopping season will increase parking demand by 40%",
            confidence: 78,
            impact: "high",
            savings: "Plan ahead",
          },
        ],
        behaviorAnalysis: {
          parkingFrequency: "4.2 times per week",
          averageSession: "2.5 hours",
          preferredLocations: ["Downtown", "Shopping District", "Business Center"],
          costEfficiency: "23% above average",
          timeEfficiency: "15% above average",
        },
        aiRecommendations: [
          {
            type: "cost",
            title: "Switch to Monthly Pass",
            description: "Save $45/month with downtown monthly parking pass",
            action: "View Options",
          },
          {
            type: "time",
            title: "Optimize Departure Times",
            description: "Leave 10 minutes earlier to reduce search time by 60%",
            action: "Set Reminders",
          },
          {
            type: "convenience",
            title: "Pre-book Popular Spots",
            description: "Reserve your top 3 locations to guarantee availability",
            action: "Enable Auto-booking",
          },
        ],
      })
      setIsLoading(false)
    }, 1500)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total AI Savings</p>
                <p className="text-2xl font-bold text-green-600">${insights.personalizedMetrics.totalSavings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Optimized</p>
                <p className="text-2xl font-bold text-blue-600">{insights.personalizedMetrics.timeOptimized}min</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-purple-600">
                  {insights.personalizedMetrics.carbonFootprintReduced}kg
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-orange-600">{insights.personalizedMetrics.aiAccuracy}%</p>
              </div>
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            AI Predictions & Insights
          </CardTitle>
          <CardDescription>Personalized recommendations based on your parking behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.predictions.map((prediction: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{prediction.title}</h4>
                  <div className="flex gap-2">
                    <Badge
                      className={`${prediction.impact === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {prediction.impact} impact
                    </Badge>
                    <Badge variant="outline">{prediction.confidence}% confidence</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-600">Potential savings: {prediction.savings}</span>
                  <Button size="sm" variant="outline">
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavior Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Behavior Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Parking Frequency</span>
                <span className="font-medium">{insights.behaviorAnalysis.parkingFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Session</span>
                <span className="font-medium">{insights.behaviorAnalysis.averageSession}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost Efficiency</span>
                <span className="font-medium text-green-600">{insights.behaviorAnalysis.costEfficiency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Efficiency</span>
                <span className="font-medium text-blue-600">{insights.behaviorAnalysis.timeEfficiency}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Preferred Locations</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {insights.behaviorAnalysis.preferredLocations.map((location: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.aiRecommendations.map((rec: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm">{rec.title}</h5>
                    <Badge
                      className={`text-xs ${
                        rec.type === "cost"
                          ? "bg-green-100 text-green-800"
                          : rec.type === "time"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {rec.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
